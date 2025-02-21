import os
import requests
def send_simple_message():
  	return requests.post(
  		"https://api.mailgun.net/v3/sandbox24a588296b9643678e9abd3035db4d1d.mailgun.org/messages",
  		auth=("api", os.getenv('API_KEY', 'API_KEY')),
  		data={"from": "Mailgun Sandbox <postmaster@sandbox24a588296b9643678e9abd3035db4d1d.mailgun.org>",
			"to": "bram Swinnen <winkel@vipcomputers.be>",
  			"subject": "Hello bram Swinnen",
  			"text": "Congratulations bram Swinnen, you just sent an email with Mailgun! You are truly awesome!"})