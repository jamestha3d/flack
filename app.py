import os
import requests

from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


channels = []
chats={}


@app.route("/")
def index():
    return render_template("index.html")


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
	channels.append(channel)
	chats[channel] = []
	emit("channel added", {"channel": channel}, broadcast=True)
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
	chats[channel] = []
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