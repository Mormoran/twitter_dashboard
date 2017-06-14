# Obtained from https://gist.github.com/MihaiTabara/631ecb98f93046a9a454

# Script to download up to <= 3200 (the official API limit) of most recent tweets from a user's timeline


from pymongo import MongoClient
from flatten_json import flatten
from bson import json_util
import tweepy
import json


#Twitter API credentials
CONSUMER_KEY = 'xz6iX3TdkL2TFmmrSXvARvJkn'
CONSUMER_SECRET = '71na1NQVNzwibLQso6S3A1mIxs8LD5Uqzu3me1wCLoTmUFlnva'
ACCESS_TOKEN = '381284132-3TSKLn9rAixDNYJOEvUQXa46Sww238zkkpvRCBZZ'
ACCESS_TOKEN_SECRET = 'M1kWjy6Ed8vzqW8g9tGieOecEbGbkxgquKlskdj1dpuMW'

class TwitterHarvester(object):
    """Create a new TwitterHarvester instance"""
    def __init__(self, consumer_key, consumer_secret,
                 access_token, access_token_secret,
                 wait_on_rate_limit=False,
                 wait_on_rate_limit_notify=False):

        self.auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
        self.auth.secure = True
        self.auth.set_access_token(access_token, access_token_secret)
        self.__api = tweepy.API(self.auth,
                                wait_on_rate_limit=wait_on_rate_limit,
                                wait_on_rate_limit_notify=wait_on_rate_limit_notify)
    
    @property
    def api(self):
        return self.__api

def twitter_logic(user_name):
    # Instantiate an object of TwitterHarvester to use it's api object
    # make sure to set the corresponding flags as True to whether or 
    # not automatically wait for rate limits to replenish
    a = TwitterHarvester(CONSUMER_KEY, CONSUMER_SECRET, 
                         ACCESS_TOKEN, ACCESS_TOKEN_SECRET,
                         wait_on_rate_limit=True,
                         wait_on_rate_limit_notify=True)
    api = a.api

    # Assume there's MongoDB running on the machine, get a connection to it
    conn = MongoClient('localhost', 27017)
    db = conn['twitter_db']
    user_name = user_name.lower()
    collection = db[user_name]

    # Use the cursor to skip the handling of the pagination mechanism 
    # http://docs.tweepy.org/en/latest/cursor_tutorial.html
    tweets = tweepy.Cursor(api.user_timeline, screen_name=user_name).items()

    # for tweet in tweets:

    #     thistweet = {
    #         'id': tweet.id,
    #         'created_at': str(tweet.created_at),
    #         # 'created_at': strptime(tweet.created_at, format),
    #         'text': tweet.text,
    #         'entities': tweet.entities,
    #         'geo': tweet.geo,
    #         'coordinates': tweet.coordinates,
    #         # 'place': tweet['place'],
    #         'retweet_count': tweet.retweet_count,
    #         'favorite_count': tweet.favorite_count,
    #         'favorited': tweet.favorited,
    #         'retweeted': tweet.retweeted
    #     }

    #     thistweet = flatten(thistweet)

    #     # hashtags = [ht['text'] for ht in tweet.entities['hashtags']]
    #     # hashtagsStr = ",".join(hashtags)
    #     # thistweet['hashtags'] = hashtagsStr

    #     jsoned_data = json.dumps(thistweet)
    #     jsoned_tweet = json.loads(jsoned_data)

    #     if collection.find({'id': thistweet['id']}).count() == 0:
    #         collection.insert(jsoned_tweet)
    #     else:
    #         collection.update_one({'id': thistweet['id']}, {'$set': {'retweet_count': thistweet['retweet_count'], 'favorite_count': thistweet['favorite_count'], 'favorited': thistweet['favorited'], 'retweeted': thistweet['retweeted']}}, upsert=False)

    while True:

        # As long as I still have a tweet to grab
        try:
            data = tweets.next()
        except StopIteration:
            break

        # Convert from Python dict-like structure to JSON format
        jsoned_data = json.dumps(data._json)
        tweet = json.loads(jsoned_data)

        tweet = flatten(tweet)

        print(tweet['text'])

        # Insert the information in the database
        if collection.find({'id': tweet['id']}).count() == 0:
            collection.insert(tweet)
            collection.update_many({'entities_hashtags_0_text': {'$exists': True}}, {'$set': {'has_hashtags': True}})
            collection.update_many({'entities_hashtags_0_text': {'$exists': False}}, {'$set': {'has_hashtags': False}})

            collection.update_many({'retweeted_status_id': {'$exists': True}}, {'$set': {'is_retweet': True}})
            collection.update_many({'retweeted_status_id': {'$exists': False}}, {'$set': {'is_retweet': False}})
        else:
            collection.update_one({'id': tweet['id']}, {'$set': {'retweet_count': tweet['retweet_count'], 'favorite_count': tweet['favorite_count'], 'favorited': tweet['favorited'], 'retweeted': tweet['retweeted']}}, upsert=False)       

        # if collection.find({'entities.hashtags[0].text': True}):
        # for i in collection.find({'entities.hashtags[i].text': True}):
        #     print({collection.entities.hashtags[i]['text']})
            # collection.update_one({'id': tweet['id']}, {'$set': {'hashtag_i': tweet['entities.hashtags[i].text']}})

if __name__ == "__main__":
    user_name = input('Please enter the Twitter handle you want to parse (Wait a moment while we parse all tweets): ')
    twitter_logic(user_name.lower())