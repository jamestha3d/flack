import os
import requests

from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


channels_list = []
chats={}
users_list = []



@app.route("/")
def index():
    return render_template("index.html", channels = channels_list)

@app.route("/channels", methods=["POST"])
def channels():
	channel = request.form.get("channel")
	
	if channel in chats:
		return jsonify(chats[channel])
	else:
		return jsonify({"error": True, "reqchan": channel})


@socketio.on("start")
def start(data):
	person = data["user"]
	if data["new"] == 'yes':
		if person not in users_list:
			users_list.append(person)
			emit('logged_in', {"user": person})
		else:
			emit('user exists')
	else:
		emit('logged_in', {"user": person})

	

@socketio.on("add channel")
def add_channel(data):
	channel = data["channel"]
	if channel in chats:
		#error
		username = data["user"]
	
		emit("already exists", {"success": False, "user": username})

	else:
		channels_list.append(channel)
		#because i am taking the channel name from document.innerHTML
		#channel = ' ' + channel + ' '
		chats[channel] = []
		emit("channel added", {"channel": channel, "success": True}, broadcast=True)
		#print('emited')



@socketio.on("chat posted")
def chat(data):
	chat = {}
	msg = data["msg"]
	username = data["username"]
	time = data["time"]	
	channel = data["channel"]
	chat["msg"] = msg
	chat["username"] = username
	chat["time"] = time
	if channel in chats:
		chats[channel].append(chat)
		if len(chats[channel]) > 100:
			chats[channel].popleft()
		emit("chat received", {"msg": msg, "username": username, "time": time, "channel": channel}, broadcast=True)
	else:
		emit('invalid session')

	

	

@socketio.on("channel entered")
def chat(data):
	username = data["user"]
	channel = data["channel"]

	emit("joined", {"user": username, "channel": channel}, broadcast=True)

