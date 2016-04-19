## The purpose of this code is to scan twitter for tweets
## In Philadlephia. Then convert them to JSON format.

## Load the packages
# install.packages("twitteR", dependencies=T)
# install.packages("ROAuth")
# install.packages("httr")
# install.packages("httpuv")
# install.packages("curl")
# install.packages("installr")
# install.packages("devtools")
 #install.packages("tm")
#  install.packages("RTextTools")
# install.packages("SnowballC")
#  install.packages('base64enc')
library(base64enc)
library(tm)
library(RTextTools)
library(SnowballC)
library(twitteR)
library(ROAuth)
library(base64enc)
library(httr)
library(httpuv)
library(curl)
library(installr)
library(devtools)


# 1. Find OAuth settings for twitter:
#    https://dev.twitter.com/docs/auth/oauth
oauth_endpoints("twitter")

# 2. Register an application at https://apps.twitter.com/

consumerKey <- ""
consumerSecret <-"" 
accessToken <- ""
accessSecret <- ""

#    Type 1 and hit Enter when 1 appears on the screen
setup_twitter_oauth(consumerKey,consumerSecret,accessToken,accessSecret)

#    Set SSL certs globally
options(RCurlOptions = list(cainfo = system.file("CurlSSL", "cacert.pem", package = "RCurl")))

#4. Get the tweets! Limit by geographic area and Time
StartTime = 
EndTime = 
traffic <- searchTwitter(" ", lang="en", n=1000, since=StartTime, until=Endtime,geocode='39.973251,-75.159063,10mi')

# 5.	Saving twitter feed as a data frame
df <- do.call("rbind", lapply(traffic, as.data.frame))

#6.	Remove all columns other than txt and long lats
df$replyToSID <- NULL
df$replyToUID <- NULL
df$replyToSN <- NULL
df$retweetCount <-NULL
df$screenName <-NULL
df$isRetweet <-NULL
df$retweeted <-NULL
df$favorited <-NULL
df$favoriteCount <-NULL
df$truncated <-NULL
df$id <-NULL
df$statusSource <-NULL

#7. Remove common words, speccial characters etc
#    Corpora are collections of documents containing (natural language) text (singular of ‘corpora’ is ‘corpus’)
#    Used in packages which employ the infrastructure provided by package tm. 
myCorpus <- Corpus(VectorSource(df$text))
#    We can do this in one line:
myCorpus <- tm_map(myCorpus, toSpace, "/|@|\\|")
#    Removing punctuation
myCorpus <- tm_map(myCorpus, removePunctuation)
#	Removing Common Pronouns
myCorpus <- tm_map(myCorpus, removeWords, stopwords("english"))
#    Removing our own stop words
myCorpus <- tm_map(myCorpus, removeWords,c("tco", "http", "qhb...", "https", "http...", "for", "totaltrafficphl"))
#	Removing whitespace characters. A whitespace character does not correspond to a visible #mark, but typically does occupy an area on a page
myCorpus <- tm_map(myCorpus, stripWhitespace)
#	Stemming (i.e., removing common word endings like "es", "ed", etc.)
myCorpus <- tm_map(myCorpus, stemDocument)
dim(df)


#8. Get Only GeoCoded Tweets
GDF =na.omit(df)
dim(GDF)


#10. Convert Tweets to JSON
#install.packages("jsonlite")
library(jsonlite)
#TweetsJSON<- toJSON(GDF, pretty=TRUE)

#11. Write JSON to file
#NewJS <- "C:/Users/Peter/Desktop/Javascript/Final/new.js"
#file.remove(NewJS)
#write(TweetsJSON,NewJS)

#12. Write CSV
NewCSV  <- "C:/Users/Peter/Desktop/Javascript/Final/phillytweets.csv"
write.csv(GDF, file = NewCSV)
