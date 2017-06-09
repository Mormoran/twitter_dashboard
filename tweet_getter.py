from flask import Flask, request, render_template, redirect, url_for
from pymongo import MongoClient
import json
from pull_tweets import twitter_logic

app = Flask(__name__)

@app.route("/")
def index():
    """
    Flask bit for index
    """
    return render_template("index.html")

@app.route("/get_tweets")
def get_tweets():
    """
    Flask bit after you grab tweets
    """
    screen_name = request.args['screen_name']
    screen_name = screen_name.lower()

    twitter_logic(screen_name)

    return redirect(url_for('show_tweets', user=screen_name))


@app.route("/show_tweets/<user>")
def show_tweets(user):
    return render_template("done.html", args=user)


@app.route("/tweetdata/<scr>")
def tweetdata(scr):
    scr=scr.lower()
    MONGODB_HOST = 'localhost'
    MONGODB_PORT = 27017
    DBS_NAME = 'twitter_db'
    COLLECTION_NAME = scr
    """
    A Flask view to serve the project data from MongoDB in JSON format.
    """

    # A constant that defines the record fields that we wish to retrieve.
    FIELDS = {
        '_id': False,
        'created_at': True,
        'text': True,
        'source': True,
        'in_reply_to_screen_name': True,
        'geo': True,
        'coordinates': True,
        'place': True,
        'retweet_count': True,
        'favorite_count': True,
        'has_hashtags': True
    }

    # Open a connection to MongoDB using a with statement such that the
    # connection will be closed as soon as we exit the with statement
    with MongoClient(MONGODB_HOST, MONGODB_PORT) as conn:

        # Define which collection we wish to access
        collection = conn[DBS_NAME][COLLECTION_NAME]

        # Retrieve a result set only with the fields defined in FIELDS
        # and limit the the results to 55000

        scr = collection.find(projection=FIELDS)

        # Convert projects to a list in a JSON object and return the JSON data
        return json.dumps(list(scr))


if __name__ == "__main__":
    app.run(debug=True)