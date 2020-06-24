import os
import requests

from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


channels_list = []
chats={}


@app.route("/")
def index():
    return render_template("index.html", channels = channels_list, chats = chats)

@app.route("/channels")
def channels(data):
	channel = data["channel"]
	lists = jsonify(chats[channel])

	return jsonify({"channels": lists})

#@app.route("/login", methods=["GET", "POST"])
#def login():
	# if request.method == 'GET':
	# 	return render_template("index.html")

	# else:

	# #if method is called, return log in page

	# #check if display name is set.
	# #if no display name, load Login Page
	# #if display name load welcome page.
	# 	return redirect("/")

@socketio.on("add channel")
def add_channel(data):
	channel = data["channel"]
	if channel in chats:
		#error
		username = data["user"]
		emit("channel already exists", {"success": False, "user": username}, broadcast=True)

	else:
		channels_list.append(channel)
		#because i am taking the channel name from document.innerHTML
		#channel = ' ' + channel + ' '
		chats[channel] = []
		emit("channel added", {"channel": channel, "success": True}, broadcast=True)
		print('emited')



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
	#chats[channel] = []
	chats[channel].append(chat)
	emit("chat received", {"msg": msg, "username": username, "time": time, "channel": channel}, broadcast=True)

@socketio.on("channel entered")
def chat(data):
	username = data["user"]
	channel = data["channel"]

	emit("joined", {"user": username, "channel": channel}, broadcast=True)






	#chats
	#channels{}
	#users{}