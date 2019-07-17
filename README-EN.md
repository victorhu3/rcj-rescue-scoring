# RoboCup Junior Rescue Scoring System
This is a scoring system used in RoboCup Junior's rescue competition.


## Demo
The latest version is running. It is built using Docker image.

[https://rcj.cloud](https://rcj.cloud)

## List of competitions using this system
### 2016 rule
* Swedish national competitions
* RoboCup Junior 2017 Kanto (Japanese local competition)
* RoboCup Junior Japan Open 2017 Gifu-Nakatsugawa (Japanese national competition)

### 2017 rule
* RoboCup 2017 Nagoya Japan
* NEST Robocon 2017
* RoboCup Junior 2018 North-Saitama (Japanese local competition)
* RoboCup Junior 2018 South-Saitama (Japanese local competition)
* RoboCup Junior 2018 Chiba (Japanese local competition)
* RoboCup Junior 2018 Hiroshima-node (Japanese local competition)
* RoboCup Junior 2018 Osaka-Central (Japanese local competition)
* RoboCup Junior 2018 Saitama (Japanese local competition)
* RoboCup Junior 2018 Kanto (Japanese local competition)
* RoboCup Junior 2018 Hiroshima (Japanese local competition)
* RoboCup Junior 2018 Kansai (Japanese local competition)
* RoboCup Junior Japan Open 2018 Wakayama (Japanese national competition)

### 2018 rule
* RoboCup 2018 Montreal Canada
* Kansai Summer Open Competition 2018

### 2019 rule
* RoboCup Junior 2019 Tokai (Japanese local competition)
* RoboCup Junior 2019 Saitama (Japanese local competition)
* RoboCup Junior 2019 Hiroshima (Japanese local competition)
* RoboCup Junior 2019 Osaka-Central (Japanese local competition)
* RoboCup Junior 2019 Kansai (Japanese local competition)
* RoboCup Junior 2019 Kanto (Japanese local competition)
* RoboCup Junior Japan Open 2019 Wakayama (Japanese national competition)
* RoboCup 2019 Sydney Australia

## Usage
### Using Docker（Recomended）
Use the  [Official docker image](https://hub.docker.com/r/ryorobo/rcj-rescue-scoring-japan) is strongly recommended.  
For detail, please go to [helper files (International version)](https://github.com/rrrobo/rcj-scoring-docker-International) to make up your environment.

### Without using docker
#### Dependent software
* [Node.js](https://nodejs.org/en/)
* [mongodb](https://www.mongodb.com)

### Install bower
`sudo npm install -g bower`

### Build dependency
`npm install`  
`bower install`  
`npm run build`  

### Make directory
`mkdir logs`

### Startup
`node server`

## Default account
The default account is as follows.

User name        | Password         |
----------------|-------------------|
admin | adminpass   |

## Sample(in Japanese)
Home(2019)
<img src="https://raw.githubusercontent.com/rrrobo/rcj-rescue-scoring-japan/master/rcjj-scoring/1.png">
<hr>
Login
<img src="https://raw.githubusercontent.com/rrrobo/rcj-rescue-scoring-japan/master/rcjj-scoring/6.png">
<hr>
Line runs
<img src="https://raw.githubusercontent.com/rrrobo/rcj-rescue-scoring-japan/master/rcjj-scoring/2.png">
<hr>
Line Judge 1 
<img src="https://raw.githubusercontent.com/rrrobo/rcj-rescue-scoring-japan/master/rcjj-scoring/3.png">
<hr>
Line Judge 2
<img src="https://raw.githubusercontent.com/rrrobo/rcj-rescue-scoring-japan/master/rcjj-scoring/4.png">
<hr>
Line Sign
<img src="https://raw.githubusercontent.com/rrrobo/rcj-rescue-scoring-japan/master/rcjj-scoring/5.png">
<hr>
Maze Judge
<img src="https://raw.githubusercontent.com/rrrobo/rcj-rescue-scoring-japan/master/rcjj-scoring/7.png">
<hr>

### Sound credit
 
* [MusMus](http://musmus.main.jp)
* [魔王魂](https://maoudamashii.jokersounds.com)
