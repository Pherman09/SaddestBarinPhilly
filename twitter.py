#Before running the code below in the Python Shell, remember to:
#1.Place your own consumer keys, etc in the variable definitions below
#2.Add your own txt file location to the listener function
#3.Choose the coordinates of the bounding box you're interested in


import tweepy
import csv
import unicodedata
from pprint import pprint

consumer_key= ""
consumer_secret= ""
access_token= ""
access_token_secret= ""

auth= tweepy.OAuthHandler(consumer_key,consumer_secret)
auth.set_access_token(access_token, access_token_secret)
api=tweepy.API(auth)

print api.me().name

def cleanText(myText):
    try:
        myText=unicodedata.normalize('NFKD', myText).encode('ascii','ignore')
        myText=myText.replace('\n', ' ')
        myText=myText.replace('\r', ' ')
        myText=myText.replace('\t', ' ')
    except:
        print "Unable to normalize Text"
        myText=''

    return myText

def search():
    tweets=api.search(q=" ",  result_type="recent", geocode="39.9526,-75.1652,15mi", count=20000)

    for tweet in tweets:
        print tweet.id
        print tweet.text
        print tweet.geo['coordinates'][0]
        print tweet.geo['coordinates'][1]
        print "------------------"
        #pprint (vars(tweet))

class Listener(tweepy.StreamListener):
    def on_status(self, status):
            f1=open(##YOUR FILE EXTENSION HERE)
            try:
                if hasattr(status,'geo'):
                    if status.geo['coordinates']:
                        f1.write('%s\t' %status.author.id)
                        f1.write('%s\t' %status.author.created_at)
                        f1.write('%s\t' %cleanText(status.text))
                        f1.write('%s\t' %status.geo['coordinates'][0])
                        f1.write('%s\n' %status.geo['coordinates'][1])
                        print status.geo['coordinates'][0], status.geo['coordinates'][1]
                        print status.created_at, status.text
                    else:
                        pass
            except:
                pass
            f1.close()
    
streaming_api=tweepy.streaming.Stream(auth,Listener(), timeout=60)
streaming_api.filter(follow=None, locations=[-75.317172,39.875158,-74.951190,40.139708])
#search()
