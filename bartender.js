#!/bin/env node

var Bot = require('ttapi');
var repl = require('repl');
var fs = require('fs');

global.bartender = {
  /**
   * Settings and Constants
   */
  bot: null, // ttapi object link
  auth: {
    "production": {
      auth: 'auth+live+386659f58edb9348a25707883bb60625efdfa468',
      userid: '4e9718a0a3f7515e5c0339c3'
    },
    "test": {
      auth: 'TcqbOvRcfXAdEgcKMTKIMLWM',
      userid: '503ecd8baaa5cd2789000094'
    }
  },
  start_time: 0, // time the bot started, for uptime tracking
  bartend: {
    activated: true,
    drinks_cocktails: ["Rum & Coke", "White Russian", "7 & 7", "Jager Bomb", "Screwdriver", "Jack & Coke", "Seven & Seven", "Irish Car Bomb", "Sex on the Beach", "Jello Shot", "Bushwacker", "Midori Sour", "Zombie", "Grasshopper", "Incredible Hulk", "shot of Chocolate Cake", "Alabama Slammer", "Mud Slide", "Royal Flush", "Mai Tai", "Amaretto Sour", "Buttery Nipple", "Malibu and Coke", "Adios Mother Fucker", "Washington Apple", "Carbomb", "Scooby Snack", "Pineapple Upside Down Cake", "Sex with an Alligator", "Monkey's Lunch", "Kamikaze", "Cosmopolitan", "Appletini", "Rocky Mountain Mother Fucker", "Long Island Iced Tea", "Amaretto Stone Sour", "Paralizer", "Cougar Juice", "Pineapple Malibu", "Mojito", "Black & Tan", "Malibu Pineapple", "Toasted Almond", "Leg Spreader", "Dark and Stormy", "Oatmeal Cookie", "Grateful Dead", "Wisconsin Lunchbox", "Rusty Nail", "Skittle Vodka", "shot of Liquid Cocaine", "American Snakebite", "Margarita", "Caraboulou", "Colorado Bulldog", "Four Horsemen", "shot of B-52", "shot of Red Death", "Pina Colada", "Screaming Blue Mother Fucker", "Shirley Temple", "Banana Mama", "Pisco Sour", "shot of Mind Eraser", "Tequila Sunrise", "Hurricane", "Malibu Baybreeze", "Red Snapper", "Friday Sign", "Yucca", "Thug Passion #1", "Long Beach Iced Tea", "China White", "Jamaican Ten Speed", "Bloody Jim", "Caipirinha #2", "Bacardi O & 7-Up", "Sicilian Kiss", "Blue Hawaiian", "Adios Mother Fucker (Studio Cafe Version)", "Melon Ball", "Nuts and Berries", "Long Island Iced Tea #2", "Arnold Palmer", "Liquid Cocaine #7", "Flaming Dr. Pepper", "Red Headed Slut", "Quick Fuck", "Pearl Harbor", "Hunch Punch", "Cape Cod", "Red Devil", "Gladiator", "Lemon Drop", "Juicy Pussy", "Singapore Sling"],
    drinks_beers: ["Budweiser", "Iron City", "Amstel Light", "Bud Light", "Red Stripe", "Smith Wicks", "Foster's", "Victory", "Corona", "Ommegang", "Chimay", "Stella Artois", "Paulaner", "Newcastle", "Samuel Adams", "Rogue", "Sam Smith's", "Yuengling", "Guiness", "Sierra Nevada", "Westvleteren", "Pabt's Blue Ribbon", "Long Trail"],
    drinks_shots: ["Buttery Nipple", "Irish Car Bomb", "Red Headed Slut", "Blow Job", "Mind Eraser", "Scooby Snack", "Purple Hooter", "Chocolate Cake", "Cinnamon Toast Crunch"],
    drinks_tea: ["Chicago Tea Garden Competition Grade Tie Guan Yin", "Thunderbolt Tea Giddapahar Musk 2009", "Joy's Teaspoon Lemon Zest Tea", "Mark T. Wendell Organic Flowery Silver Needle White Tea", "Jacksons of Piccadilly Fair Trade Assam Tea", "Organic Red Leaf Tea White Matcha", "Mariage Freres Marco Polo Tea", "The NecessiTeas Vanilla Cola Tea", "LeafSpa Eagle Nest Ever Drop Green Tea", "American Tea Room Milk Oolong", "Norbu Tea Ya Bao Camellia Varietal Wild White Tea", "Joy's Teaspoon Sunny Passion Tea", "American Tea Room Bao Zhong Royale", "Merkaba Quangzhou Milk Oolong Tea", "TeaGschwender China Yin Zhen Silver Needle Tea", "Culinary Teas Chocolate Mint", "De Vos Tea Cinnamon Black Tea", "The Teacup Turkish Lime Tea", "American Tea Room Organic Yunnan Golden Needles", "HopStiles Pancake Tea"],
    msgList: function(name, params, drink, type) {
      var messages = ["Here " + name + ", have a " + drink + " on me.",
            "I have just the thing " + name + ".. a " + drink + ".",
            "Here you go " + name + ", a " + drink + ". That'll be $" + Math.floor(Math.random() * 101) + "."
      ];
  
      if(type == 1) { //tea 
        messages = ["Here " + name + ", try a cup of " + drink + " on me.",
            "I have just the thing " + name + ".. a cup of " + drink + " with a subtle hint of awesome.",
            "Here you go " + name + ", a cup of searing hot " + drink + ". That'll be $" + Math.floor(Math.random() * 21) + "."
        ];
      }
  
      var username = params;
  
      if(username != "" && username.toLowerCase() != name.toLowerCase()) {
        if(type == 0)
          global.bartender.bot.speak("Hey " + username + ", " + name + " just gave you a " + drink + ".");
        else
          global.bartender.bot.speak("Hey " + username + ", " + name + " just gave you a cup of " + drink + ".");
      }
      else
        global.bartender.bot.speak(messages[Math.floor(Math.random() * messages.length)]);
    }
  },
  hitter: {
    timer: null,
    timerStart: null,
    users: [],
    getMsg: function() {
      var users = '';
      for(var i = 0; i < global.bartender.hitter.users.length; i++) {
        if(i > 0) users += ", ";
        users += global.bartender.hitter.users[i];
      }
      global.bartender.bot.speak('The bowl is cashed! People who took a hit: ' + users);
      global.bartender.hitter.timer = null;
      global.bartender.hitter.users = [];
    }
  },
  moderation: {
    activated: false,
    songsPerDj: 2,
    songsWait: 2,
    djPlays: [], // { userid, username, plays, timer, added }
    waitingList: [],
    bannedDjs: [], // { userid, username, time } --- Users banned from DJ'ing
    bannedUsers: [], // userid, username, time } --- Users banned from room
    addDj: function(userid) {
      // check to see if user is banned
      if(this.moderation.djBanned.call(this, userid)) {
        this.bot.remDj(userid);
        this.bot.pm('You are not allowed to DJ in this room right now, sorry!', userid);
        return false;
      }
      var found = false;
      for(var i = 0; i < this.moderation.djPlays.length; i++) {
        if(this.moderation.djPlays[i].userid == userid) {
          found = true;
          clearTimeout(this.moderation.djPlays[i].timer);
          this.moderation.djPlays[i].timer = 0;
          this.moderation.djPlays[i].added = (new Date()).getTime();
          break;
        }
      }
      if(!found) {
        var user = this.room.users[userid];
        if(user === undefined)
          user = { name: userid };
        this.moderation.djPlays.push({ userid: userid, username: user.name, plays: 0, timer: 0, added: (new Date()).getTime() });
      }
      
      return true;
    },
    remDj: function(userid) {
      for(var i = 0; i < this.moderation.djPlays.length; i++) {
        if(this.moderation.djPlays[i].userid == userid) {
          (function() {
            var djPos = i;
            global.bartender.moderation.djPlays[i].timer = setTimeout(function() {
              global.bartender.moderation.djPlays.splice(djPos, 1);
            }, 600000);
          })();
          break;
        }
      }
    },
    addPlay: function(userid) {
      for(var i = 0; i < this.moderation.djPlays.length; i++) {
        if(this.moderation.djPlays[i].userid == userid) {
          this.moderation.djPlays[i].plays++;
          break;
        }
      }
    },
    addWaitPlay: function(userid) {
      for(var i = 0; i < this.moderation.waitingList.length; i++) {
        if(this.moderation.waitingList[i].userid == userid) {
          this.moderation.waitingList[i].plays++;
        }
      }
    },
    addWaitPlayAll: function() {
      for(var i = 0; i < this.moderation.waitingList.length; i++) {
        this.moderation.waitingList[i].plays++;
      }
    },
    checkDjCounts: function() {
      var djList = [], waitingList = [];
      for(var i = 0; i < this.moderation.djPlays.length; i++) {
        if(this.moderation.djPlays[i].plays < this.moderation.songsPerDj)
          djList.push(this.moderation.djPlays[i]);
        else {
          waitingList.push({ userid: this.moderation.djPlays[i].userid, plays: 0 });
          //debug
          //ttBot.sendPm("4e3ab2f2a3f751254c049bec", 'User ' + this.moderation.djPlays[i].userid + ' has played allotted dj songs and added to wait list.');
        }
      }
      this.moderation.djPlays = djList;
      this.moderation.waitingList.push(waitingList);
    },
    checkWaitCounts: function() {
      var list = [];
      for(var i = 0; i < this.moderation.waitingList.length; i++) {
        if(this.moderation.waitingList[i].plays < this.moderation.songsWait)
          list.push(this.moderation.waitlingList[i]);
      }
      this.moderation.waitlingList = list;
    },
    setDjPlaysCount: function(userid, count) {
      if(count > this.songsPerDj) return false;
      for(var i = 0; i < this.djPlays.length; i++) {
        if(this.djPlays[i].userid == userid) {
          this.djPlays[i].plays = count;
          break;
        }
      }
      return true;
    },
    setWaitCount: function(userid, count) {
      if(count > this.songsWait) return false;
      for(var i = 0; i < this.waitingList.length; i++) {
        if(this.waitingList[i].userid == userid) {
          this.waitingList[i].plays = count;
          break;
        }
      }
      return true;
    },
    getDjCounts: function(extended) {
      var msg = 'DJ Play Counts: ';
      for(var i = 0, count = 0; i < this.moderation.djPlays.length; i++) {
        if(extended === undefined && this.moderation.djPlays[i].timer) continue;
        if(count > 0) msg += ', ';
        msg += this.moderation.djPlays[i].username + ': ' + this.moderation.djPlays[i].plays + ' songs';
        if(extended !== undefined) {
          var time = parseInt(((new Date()).getTime() - this.moderation.djPlays[i].added) / 1000 / 60); // time on deck in minutes
          msg += ' (' + time + ' mins, ' + (this.moderation.djPlays[i].timer ? 'waiting' : 'djing') + ')';
        }
        count++;
      }
      return msg;
    },
    getWaitCounts: function() {
      var msg = 'Wait Counts: ';
      for(var i = 0; i < this.moderation.waitingList.length; i++) {
        var user = this.room.users[this.moderation.waitingList[i].userid];
        if(undefined === user) continue;
        if(i > 0) msg += ', ';
        msg += user.name + ': ' + (this.moderation.songsWait - this.moderation.waitingList[i].plays) + ' songs';
      }
      return msg;
    },
    checkDjList: function() {
      return; // test to see if we really need this
      // get updated dj list
      var djList = [];
      for(var i = 0; i < this.moderation.djPlays.length; i++) {
        var found = false;
        for(var j = 0; j < this.room.djs.length; j++) {
          if(this.moderation.djPlays[j].userid == this.room.djs[i]) {
            found = true;
            djList.push(this.moderation.djPlays[j]);
            break;
          }
        }
        if(!found)
          djList.push({ userid: this.room.djs[i], plays: 0, timer: 0 });
      }
      this.moderation.djPlays = djList;
    },
    addDjBan: function(userid, username, time) {
      // check to see if user is already in banned list
      this.moderation.remDjBanById.call(this, userid);
      this.moderation.bannedDjs.push({ userid: userid, username: username, time: (new Date()).getTime() + parseInt(time) * 3600000 });
      if(this.isDj(userid))
        this.bot.remDj(userid);
    },
    remDjBan: function(username) {
      // check to see if user is already in banned list
      for(var i = 0; i < this.moderation.bannedDjs.length; i++) {
        if(this.moderation.bannedDjs[i].username === username) {
          this.moderation.bannedDjs.splice(i, 1);
          return true;
        }
      }
      return false;
    },
    remDjBanById: function(userid) {
      // check to see if user is already in banned list
      for(var i = 0; i < this.moderation.bannedDjs.length; i++) {
        if(this.moderation.bannedDjs[i].userid == userid) {
          this.moderation.bannedDjs.splice(i, 1);
          break;
        }
      }
    },
    getBannedDjs: function() {
      this.moderation.checkBannedDjs.call(this);
      var msg = 'Banned DJ\'s: ';
      for(var i = 0; i < this.moderation.bannedDjs.length; i++) {
        if(i > 0) msg += ', ';
        var duration = (parseInt((this.moderation.bannedDjs[i].time - (new Date()).getTime()) / 360000) / 10);
        msg += this.moderation.bannedDjs[i].username + ' (' + duration + ' hours)';
      }
      return msg;
    },
    checkBannedDjs: function() {
      for(var i = 0; i < this.moderation.bannedDjs.length; i++) {
        var duration = ((this.moderation.bannedDjs[i].time - (new Date()).getTime()) / 3600000);
        if(duration <= 0)
          this.moderation.remDjBanById.call(this, this.moderation.bannedDjs[i].userid);
      }
    },
    djBanned: function(userid) {
      this.moderation.checkBannedDjs.call(this);
      for(var i = 0; i < this.moderation.bannedDjs.length; i++) {
        if(this.moderation.bannedDjs[i].userid === userid)
          return true;
      }
      return false;
    },
    banUser: function(userid, username) {
      // check to see if user already exists in list
      for(var i = 0, l = this.bannedUsers.length; i < l; i++) {
        if(this.bannedUsers[i].userid === userid) {
          // user already exists, break and send message
          return false;
        }
      }
      this.bannedUsers.push({ userid: userid, username: username, time: (new Date()).getTime() });
      this.writeBannedUsersFile();
      if(global.bartender.isInRoom.call(global.bartender, userid))
        global.bartender.bot.bootUser(userid, 'Sorry, you have been permanently banned from this room.');
      return true;
    },
    unBanUser: function(userid, username) {
      // check to see if user exists in list
      var found = -1;
      for(i = 0, l = this.bannedUsers.length; i < l; i++) {
        if((userid !== null && this.bannedUsers[i].userid === userid)
          || (userid === null && username !== undefined && this.bannedUsers[i].username.toLowerCase() === username.toLowerCase())
        ) {
          found = i;
          break;
        }
      }
      if(found < 0) return false;
      this.bannedUsers.splice(found, 1);
      this.writeBannedUsersFile();
      return true;
    },
    userBannedFromRoom: function(userid) {
      for(var i = 0, l = this.bannedUsers.length; i < l; i++) {
        if(this.bannedUsers[i].userid === userid)
          return true;
      }
      return false;
    },
    getBannedUsers: function() {
      var users = 'Banned Users: ';
      for(var i = 0, l = this.bannedUsers.length; i < l; i++) {
        if(i > 0) users += ', ';
        users += this.bannedUsers[i].username;
      }
      return users;
    },
    writeBannedUsersFile: function() {
      fs.writeFile(process.env.OPENSHIFT_DATA_DIR + 'banned_users.txt', JSON.stringify(this.bannedUsers), function(err) {
        if(err) { console.log('There was an error while writing the banned users\' file:'); console.log(err); }
      });
    }
  },
  queue: {
    activated: false,
    list: []
  },
  room: { // holds real-time information for the turntable.fm room
    name: '',
    description: '',
    creator: '',
    moderatorList: [],
    users: { },
    djs: { },
    currentSong: {
      dj: {
        id: '',
        name: '',
      },
      songid: null,
      title: null,
      artist: null,
      length: 0,
      time: 0,
      awesomes: 0,
      awesomeUsersList: [],
      lames: 0,
      lameUsersList: [],
      snags: 0,
      snaggedUsersList: []
    }
  },
  welcomeList: [],
  welcomeCheck: function(userid) {
    if(this.isMod(userid)) return false;
    var pos = -1;
    for(var i = 0, l = this.welcomeList.length; i < l; i++) {
      if(this.welcomeList[i][0] == userid) {
        pos = i;
        break;
      }
    }
    if(pos == -1) {
      this.welcomeList.push([userid, 1]);
      return true;
    }
    else {
      if(this.welcomeList[pos][1] < 3) {
        this.welcomeList[pos][1]++;
        return true;
      }
    }
    return false;
  },
  lastSeen: {},
  songKickTimer: 0, // timer that will boot a user off deck if the song has not changed 10 seconds after theirs has finished played. This will make sure no songs are stuck.
  songTooLongLength: 480000, // 8 minutes, in milliseconds
  songTooLongTimer: 0, // will boot a user off the deck if their song exceeds songKickLength
  
  /**
   * Constructor for bot, initiates connection to tt.fm.
   */
  init: function(test) {
    var auth = test ? this.auth.test : this.auth.production;
    this.bot = new Bot(auth.auth, auth.userid, '4dd926e1e8a6c4198c000803');
    
    // set start_time
    this.start_time = (new Date()).getTime();
    
    // read and set Banned Users list
    fs.readFile(process.env.OPENSHIFT_DATA_DIR + 'banned_users.txt', function(err, data) {
      if(err) { console.log('Error while getting banned users\' list: '); console.log(err); return false; }
      global.bartender.moderation.bannedUsers = JSON.parse(data);
      return true;
    });
    
    // event handlers
    this.bot.on('roomChanged', function(d) {
      if(d.success) {
        var song = d.room.metadata.current_song;
        // setup room metadata based on current values upon joining room
        global.bartender.room.name = d.room.name;
        global.bartender.room.description = d.room.description;
        global.bartender.room.creator = d.room.metadata.creator;
        global.bartender.room.moderatorList = d.room.metadata.moderator_id;
        global.bartender.room.currentSong.dj.id = song.djid;
        global.bartender.room.currentSong.dj.name = song.djname;
        global.bartender.room.currentSong.length = song.metadata.length;
        global.bartender.room.currentSong.time = song.starttime;
        global.bartender.room.currentSong.songid = song._id;
        global.bartender.room.currentSong.title = song.metadata.song;
        global.bartender.room.currentSong.artist = song.metadata.artist;
        global.bartender.room.currentSong.awesomes = d.room.metadata.upvotes;
        global.bartender.room.currentSong.lames = d.room.metadata.downvotes;
        global.bartender.room.djs = d.djids;
        
        // register all current users of room
        for(var i = 0, l = d.users.length; i < l; i++)
          global.bartender.registered({ "user": [ d.users[i] ] }, true);
        
        // add current dj's
        for(i = 0, l = d.djids.length; i < l; i++)
          global.bartender.moderation.addDj.call(global.bartender, d.djids[i]);
      }
      else {
        // temporary ban or room is full, try again... 
      }
    });
    
    this.bot.on('registered', function(d) {
      global.bartender.registered.call(global.bartender, d);
    });
    
    this.bot.on('deregistered', function(d) {
      global.bartender.deregistered.call(global.bartender, d);
    });
    
    this.bot.on('newsong', function(d) {
      global.bartender.newsong.call(global.bartender, d);
    });
    
    this.bot.on('snagged', function(d) {
      global.bartender.room.currentSong.snags++;
      global.bartender.room.currentSong.snaggedUsersList.push(d.userid);
      global.bartender.resetAFK(d.userid, false);
    });

    this.bot.on('update_votes', function(d) {
      global.bartender.updateVotes.call(global.bartender, d);
    });

    this.bot.on('add_dj', function(d) {
      global.bartender.moderation.addDj.call(global.bartender, d.user[0].userid);
      global.bartender.room.djs.push(d.user[0].userid);
    });

    this.bot.on('rem_dj', function(d) {
      global.bartender.moderation.remDj.call(global.bartender, d.user[0].userid);
      for(var i = 0, l = global.bartender.room.djs.length; i < l; i++) {
        if(d.user[0].userid == global.bartender.room.djs[i])
          global.bartender.room.djs.splice(i, 1);
      }
    });
    
    this.bot.on('speak', function(d) {
      global.bartender.preMessage.call(global.bartender, d);
    });
    
    this.bot.on('pmmed', function(d) {
      global.bartender.preMessage.call(global.bartender, d);
    });
  },
  registered: function(d, init) {
    this.room.users[d.user[0].userid] = d.user[0];
    if(this.moderation.userBannedFromRoom(d.user[0].userid))
      this.bot.bootUser(d.user[0].userid, "Sorry, you have been permanently banned from this room.");
    else if(this.welcomeCheck(d.user[0].userid) && undefined === init)
      this.bot.pm('Welcome to the Dubstep room! Type /roominfo to see what this room is all about and to learn the rules for getting up on deck. Type /help to learn more about my commands.', d.user[0].userid);
    this.resetAFK(d.user[0].userid, false);
  },
  deregistered: function(d) {
    if(d.user[0].userid in this.room.users) {
      delete this.room.users[d.user[0].userid];
    }
    this.resetAFK(d.user[0].userid, true);
    
    // make sure they are not in djs list
    for(var i = 0, l = this.room.djs.length; i < l; i++) {
      if(d.user[0].userid == this.room.djs[i])
        this.room.djs.splice(i, 1);
    }
  },
  newsong: function(d) {
    // send message to chat
    this.bot.speak('' + this.room.currentSong.dj.name + ' played \u266C' + this.room.currentSong.title + ' by ' + this.room.currentSong.artist + '\u266C [+' + this.room.currentSong.awesomes + ', -' + this.room.currentSong.lames + '] ' + this.room.currentSong.snags + '\u2665 ' + Object.keys(this.room.users).length + ' Listeners');
    
    // clear stats
    this.room.currentSong.dj.id = d.room.metadata.current_song.djid;
    this.room.currentSong.dj.name = d.room.metadata.current_song.djname;
    this.room.currentSong.songid = d.room.metadata.current_song._id;
    this.room.currentSong.title = d.room.metadata.current_song.metadata.song;
    this.room.currentSong.artist = d.room.metadata.current_song.metadata.artist;
    this.room.currentSong.length = d.room.metadata.current_song.metadata.length;
    this.room.currentSong.starttime = d.room.metadata.current_song.starttime;
    this.room.currentSong.awesomes = 0;
    this.room.currentSong.awesomeUsersList = [];
    this.room.currentSong.lames = 0;
    this.room.currentSong.lameUsersList = [];
    this.room.currentSong.snags = 0;
    this.room.currentSong.snaggedUsersList = [];
    
    // check to see if song is too long
    clearTimeout(this.songTooLongTimer);
    // check song length and pm if too long (in seconds)
    if(d.room.metadata.current_song.metadata.length > (this.songTooLongLength / 1000)) {
      var mins = this.songTooLongLength / 60000;
      this.bot.pm('You\'re song is longer than ' + mins + ' minutes! Please skip it at 8 minutes or run the risk of getting booted off deck. (We do not allow songs longer than ' + mins + ' minutes).', d.room.metadata.current_song.djid);
      this.songTooLongTimer = setTimeout(function() {
        global.bartender.bot.remDj(global.bartender.room.currentSong.dj.id);
      }, this.songTooLongLength + 5000);
    }
    
    // setup songKick timer
    clearTimeout(this.songKickTimer);
    this.songKickTimer = setTimeout(function() {
      global.bartender.bot.pm('Looks like your song froze, so we had to remove you from the deck.', global.bartender.room.currentSong.dj.id);
      global.bartender.bot.remDj(global.bartender.room.currentSong.dj.id);
    }, (this.room.currentSong.length + 15) * 1000);
    
    // moderation actions
    this.moderation.checkDjList.call(this);
    
    // add to song count of current dj
    this.moderation.addPlay.call(this, d.room.metadata.current_song.djid);
    
    // check banned dj's list for expired users
    this.moderation.checkBannedDjs.call(this);
    
    if(this.moderation.activated) {
      this.moderation.addWaitPlayAll.call(this);
      this.moderation.checkWaitCounts.call(this);
      this.moderation.checkDjCounts.call(this);
    }
    if(this.queue.activated) {
      
    }
  },
  updateVotes: function(d) {
    this.room.currentSong.awesomes = d.room.metadata.upvotes;
    this.room.currentSong.lames = d.room.metadata.downvotes;
    for(var ij = 0; ij < d.room.metadata.votelog.length; ij++) {
      if(d.room.metadata.votelog[ij][0].length > 0)
        this.resetAFK(d.room.metadata.votelog[ij][0], false);
        
      if(d.room.metadata.votelog[ij][1] == "down") {
        this.room.currentSong.lameUsersList.push(d.room.metadata.votelog[ij][0]);
        // search awesomes and remove if present
        for(var i = 0; i < this.room.currentSong.awesomeUsersList.length; i++) {
          if(this.room.currentSong.awesomeUsersList[i] == d.room.metadata.votelog[ij][0]) {
            this.room.currentSong.awesomeUsersList.splice(i, 1);
          }
        }
      }
      else {
        this.room.currentSong.awesomeUsersList.push(d.room.metadata.votelog[ij][0]);
        // search lames and remove if present
        for(i = 0; i < this.room.currentSong.lameUsersList.length; i++) {
          if(this.room.currentSong.lameUsersList[i] == d.room.metadata.votelog[ij][0]) {
            this.room.currentSong.lameUsersList.splice(i, 1);
          }
        }
      }
    }
  },
  preMessage: function(d) {
    var hasSlash = false;
    var command = d.text;
    var paramStart = -1;
    var params = '';
    var userid = d.userid;
    var name = d.name;
    
    if(d.text.indexOf("/") == 0) {
      hasSlash = true;
      command = d.text.substr(1);
    }
    
    if((d.command == "speak" && d.userid == "4e9718a0a3f7515e5c0339c3")
      || (d.command == "pmmed" && d.senderid == "4e9718a0a3f7515e5c0339c3")) return;
    
    if(d.command == "pmmed") {
      userid = d.senderid;
      if(this.room.users[userid] === undefined)
        name = 'N/A';
      else
        name =this.room.users[userid].name;
    }
    
    this.resetAFK(userid, false);
    
    // check for exact identifiers before moving on
    // currently just for seeing if the user is trying to add to queue
    if(command.search(/\/?\-?\+?(q|queue|que)\+?\-?\??$/i) == 0 && !this.queue.activated)
      return this.bot.speak(((name.search(/^@/) == 0) ? name : '@'+name) + ', this room does NOT have a queue. For more information, type /roominfo.');
    
    if(d.command == "speak" && !hasSlash) return;
    
    paramStart = command.indexOf(' ');
    if(paramStart > 0) {
      params = command.substr(paramStart + 1);
      command = command.substr(0, paramStart);
    }
    this.handleMessage(command.toLowerCase(), params, userid, name);
  },
  resetAFK: function(userid, del) {
    if(del) {
      if(this.lastSeen.hasOwnProperty(userid))
        delete this.lastSeen[userid];
    }
    else
      this.lastSeen[userid] = {time: new Date().getTime(), messaged: false};
  },
  findAFKs: function() {
    return;
    var time = 0;
    for(var prop in this.lastSeen) {
      if((this.lastSeen[prop].time < (new Date().getTime() - 900000)) && !this.lastSeen[prop].messaged && !this.isMod(prop) && prop != "4e9718a0a3f7515e5c0339c3") {
        this.lastSeen[prop].messaged = true;
        (function() {
          var userid = prop.valueOf().toString();
          setTimeout(function() {
            global.bartender.bot.pm('Hey there, I see you have been idle for 15 minutes! Please remember to stay active & participating while listening on Turntable.fm by voting for every song. You can do this easy and automatically with http://izzmo.com/tt/', userid);
          }, time);
          time += 5000;
        })();
      }
    }
  },
  handleMessage: function(command, params, userid, name) {
    switch(command) {
      case 'commands':
      case 'command':
      case 'cmds':
      case 'cmd':
      case 'help':
        this.bot.pm('Public commands (said in main chat): /drink /drink [username] /beer /shot /tea /smokesesh /hookah', userid);
        this.bot.pm('Private commands (messaged to me): topdjs, lastplayed, firstplayed, search [title OR artist] [search keyword], searchfirst [title OR artist] [search keyword], top10, mostplayed, currentvote, hearts, mods, people, roominfo, about', userid);
        this.bot.pm('If you have any questions, please message @Izzmo or a moderator of the Dubstep room. (Type mods for a list of moderators)', userid);
        break;
        
      case 'people':
      case 'ppl':
        if(Object.keys(this.room.users).length > 1)
          this.bot.pm("There are currently " + Object.keys(this.room.users).length + " people in the room.", userid);
        else
          this.bot.pm("There is currently 1 person in the room.", userid);
        break;
        
      case 'mods':
        this.bot.pm("To see the list of moderators, please visit http://ttstats.info/room/dubstep", userid);
        break;
        
      case 'search':
        return;
        
        var what = params.split(" ");
        if(what.length <= 1) return;

        switch(what[0]) {
          case "artist":
            ttBot.findSongByArtist(params.substr(7).toLowerCase(), 0, function(msg) {ttBot.sendPm(userid, msg);});
            break;

          case "title":
            ttBot.findSongByTitle(params.substr(6).toLowerCase(), 0, function(msg) {ttBot.sendPm(userid, msg);});
            break;
        }
        break;
        
      case 'searchfirst':
        return;
        
        var what = params.split(" ");
        if(what.length <= 1) return;

        switch(what[0]) {
          case "artist":
            ttBot.findSongByArtist(params.substr(7).toLowerCase(), 1, function(msg) {ttBot.sendPm(userid, msg);});
            break;

          case "title":
            ttBot.findSongByTitle(params.substr(6).toLowerCase(), 1, function(msg) {ttBot.sendPm(userid, msg);});
            break;
        }
        break;
        
      case 'top10':
        return;
        
        ttBot.getTopSongs(function(msg) {ttBot.sendPm(userid, msg);});
        break;
        
      case 'mostplayed':
        return;
        
        ttBot.getTopPlays(function(msg) {ttBot.sendPm(userid, msg);});
        break;
        
      case 'stats':
        return;
        
        var what = params.split(" ");
        var user = "";

        for(var i = 0; i < what.length; i++) {
          if(i > 0) user += " ";
          user += what[i];
        }

        if(user.length > 0) { // need a username
          ttBot.getStats(user, function(msg) {ttBot.sendPm(userid, msg);});
        }
        break;
        
      case 'about':
        this.bot.pm("Made with tender, loving care by @Izzmo. http://izzmo.com", userid);
        break;
        
      case 'info':
      case 'roominfo':
      case 'rules':
        this.bot.pm("Dubstep Room has a 2-song limit for DJ's. DJ spots are Free-For-All, so please do not request for one unless you are a producer. Once you have played your 2 songs, you must drop for 2 songs until you can get back on deck. If you are idle for 15 minutes while on deck, you will be automatically removed. Once you appear on deck, you have 1-minute to respond to a mod to show you are active. For more information, please take a look at http://tinyurl.com/7tfyfcb", userid);
        break;
        
      case 'uptime':
        this.getUptime(function(msg) { global.bartender.bot.pm(msg, userid); });
        break;
        
      case 'topdjs':
        return;
        
        ttBot.getTopDjs24(function(msg) {ttBot.sendPm(userid, msg);});
        break;
        
      case 'say':
        if(!this.isMod(userid)) return;
        this.bot.speak(params);
        break;
        
      case 'dive':
      case 'stagedive':
        if(this.isDj(userid))
          this.bot.remDj(userid);
        break;
        
      case 'vote':
        if(!this.isMod(userid)) return;
        if(params == "awesome" || params == "up")
          this.bot.vote('up');
        else if(params == "lame" || params == "down")
          this.bot.vote('down');
        break;
        
      case 'hearts':
      case 'snags':
        switch(this.room.currentSong.snags) {
          case 0:
            this.bot.pm("This song has 0 snags.", userid);
            break;
          case 1:
            this.bot.pm("This song has currently been snagged 1 time.", userid);
            break;
          default:
            this.bot.pm("This song has currently been snagged " + this.room.currentSong.snags + " times.", userid);
        }
        break;
        
      case 'votes':
      case 'currentvote':
        this.bot.pm('+' + this.room.currentSong.awesomes + ', -' + this.room.currentSong.lames, userid);
        break;
        
      case 'drink':
        var type = Math.floor(Math.random()*3);
        var drink = "";
        switch(type) {
          case 0:
            drink = this.bartend.drinks_cocktails[Math.floor(Math.random() * this.bartend.drinks_cocktails.length)];
            break;
          case 1:
            drink = this.bartend.drinks_beers[Math.floor(Math.random() * this.bartend.drinks_beers.length)];
            break;
          case 2:
            drink = "shot of " + this.bartend.drinks_shots[Math.floor(Math.random() * this.bartend.drinks_shots.length)];
            break;
        }
        this.bartend.msgList(name, params, drink, 0);
        break;
        
      case 'beer':
        this.bartend.msgList(name, params, this.bartend.drinks_beers[Math.floor(Math.random() * this.bartend.drinks_beers.length)], 0);
        break;
        
      case 'shot':
        this.bartend.msgList(name, params, this.bartend.drinks_shots[Math.floor(Math.random() * this.bartend.drinks_shots.length)], 0);
        break;
        
      case 'tea':
        this.bartend.msgList(name, params, this.bartend.drinks_tea[Math.floor(Math.random() * this.bartend.drinks_tea.length)], 1);
        break;
        
      case 'coffee':
      case 'joe':
        this.bot.speak('Here you go ' + name + ', a searing hot, black cup of joe! Creamer and sugar are for pussies.');
        break;
        
      case 'blowjob':
        var type = Math.floor(Math.random() * 3);
        switch(type) {
          case 0:
            this.bot.speak("Okay " + name + ", I'll give you a blowjob, but my mouth is kind of dry.");
            break;
          case 1:
            this.bot.speak("I'm too tired for that right now " + name + ".");
            break;
          case 2:
            this.bot.speak("" + name + ", I don't give blowies to ugly people.");
            break;
        }
        break;
        
      case 'bend':
        this.bot.speak("Hey " + name + ", you are one sick bastard. That hole has only one way: out.");
        break;
        
      case 'boobies':
      case 'boobs':
      case 'boob':
        var type = Math.floor(Math.random() * 4);
        switch(type) {
          case 0:
            this.bot.speak("/me shows boobies at " + name + ", but is kind of flat chested.");
            break;
          case 1:
            this.bot.speak("/me finds Persef and lifts up her shirt.");
            break;
          case 2:
            this.bot.speak("( .  Y  . )  Who doesn't like'em?");
            break;
          case 3:
            this.bot.speak("/me whips out 3=======D ... oh, not that?");
            break;
          case 4:
            this.bot.speak("/me looks at Persef and tells her to feel herself up and make erotic noises.");
            break;
        }
        break;
        
      case 'smoke':
      case 'smokesesh':
        var messages = [
          "/me brings out the mega-bong and begins to pass it around the room...",
          "/me rolls a fat blunt and starts passing it around the room...",
          "/me loads a bowl and strikes a flame...",
          "/me brings out the double-percolator and gets the room chillin...",
          "/me rolls a spliff suited for kings...",
          "/me brings out the Billy Bong Thorton for this magnificent moment. Take off your shoes before taking a hit.",
          "/me pulls out Wesley Pipes from under the bar... it's time to party.",
          "/me unloads a box full of Mary Jane on the table.. smoke as much as you can.",
          "/me scrapes the kief out from everyone's grinders and puts them into a big pile for everyone to smoke...",
          "Alright " + name + ", give me some of your ace and I'll show you how a real man takes a hit.",
          "I'm all out of the ganja! We better go get some more from the basement...",
          "Are you sure you're ready to ride the Gravitron? There ya go, now thats a spicey meatball!"
        ];
        this.bot.speak(messages[Math.floor(Math.random() * messages.length)]);
        if(this.hitter.timer === null) {
          this.hitter.timer = setTimeout(function() { global.bartender.hitter.getMsg(); }, 30000);
          setTimeout(function() { global.bartender.bot.speak("The bowl is almost cashed; /hit it fast before it's gone!"); }, 20000);
          this.hitter.timerStart = new Date();
          this.hitter.users.push(name);
        }
        break;
        
      case 'hit':
      case 'rip':
      case 'toke':
      case 'cough':
      case 'puff':
        if(this.hitter.timer === null) return;
        
        // add user to list
        var found = false;
        for(var i = 0; i < this.hitter.users.length; i++) {
          if(this.hitter.users[i] == name) {
            found = true;
            break;
          }
        }
        if(!found) {
          this.hitter.users.push(name);
          clearTimeout(this.hitter.timer);
          this.hitter.timer = setTimeout(function() { global.bartender.hitter.getMsg(); }, 30000 - (new Date() - this.hitter.timerStart) + this.hitter.users.length * 5000);
        }
        break;
        
      case 'hookah':
        var flavors = ["Mint", "Lemon", "Watermelon", "Orange", "Fuzzy Navel", "Sex on the Beach", "1001 Nights", "Acai Berry", "Acid Blue", "Acid Gold", "Acid Purple", "Acid Red", "Afternoon Delight", "Almond", "Ambrosia", "Apple", "Apple Americano", "Apple Cinnamon", "Apple Jax", "Apple Martini", "Apricot", "Arabian Coffee", "Arabic Coffee", "Atomic Fireball", "Banana", "Banana Hammok", "Banana Split", "Berry", "Big Melons", "Black Grape", "Blackberry", "Blue Mist", "Blueberry", "Blueberry Grape", "Blueberry Pancakes", "Bubble Gum", "Butterscotch", "Candy", "Cantaloupe", "Cappuccino", "Caramel", "Caramel Apple", "Caramel Macchiatoo", "Cardamom", "Chai Tea", "Champagne", "Cherry", "Cherry Cola", "Cherry Vanilla Float", "Chocolate", "Chocolate Mint", "Chocolate Raspberry", "Chocomint", "Cinnamon", "Citris Mint", "Citrus Assult", "Citrus Mint", "Citrus Mist", "Classic Mojito", "Clove", "Coconut", "Coctail", "Code 69", "Cola", "Cosmopolitan", "Cotton Candy", "Cranberry", "Cream Soda", "Cuban Mojito", "Dazed & Confused", "Double Apple", "Dragon Fruit", "Earl Grey", "Energy", "Flower Power", "Freak's Choice", "French Vanilla", "Fruit Punch", "Fruit Sensation", "Fuzzy Lemonade", "Gingerbread", "Golden Amber", "Graham Crackers", "Grape", "Grape with Mint", "Grapefruit", "Grapeful Dead", "Grasshoppah", "Green Apple", "Grenadine", "Guava", "Guava Breeze", "Gum", "Half Baked", "Hazelnut", "Holy Shisha", "Honey", "Honey Berry", "Huckleberry Ho-Down", "Incredible Hulk", "Irish Cream", "Jack & Coke", "Jamaican Rum", "Jasmine", "Kahlua", "Key Lime Pie", "Kiwi", "Kiwi Strawberry", "Lemon Mint", "Lemon Pepper", "Lemon Tea", "Lemon with Mint", "Lemonade", "Licorice", "Lime-Lemon", "Long Island Ice Tea", "Malibu Sunrise", "Mandarin", "Mango", "Margarita", "Marlette", "Melon", "Melon Blue", "Melon Medley", "Melon Sour", "Menthol", "Mixed Fruit", "Mocha", "Mocha Latte", "Mojito", "Mon Cherry", "Neopolitan Dynomite", "Orange Sherbet", "Passion Fruit", "Passion Fruit Mojito", "Passion Kiss", "Peach", "Peach Cobler", "Peach Queen", "Peaches N Cream", "Peanut ButtaJelly", "Peanut Butter", "Pear", "Pina Colada", "Pineapple", "Pink", "Pink Lady", "Pink Lemonade", "Pipe", "Pirates Cave", "Pistacio", "Plum", "Pomberry", "Pomegranate", "Pumpkin Pie", "Pumpkin Spice", "Purple Haze", "Raspberry", "Raspberry Kamikaze", "Raspberry Lemonade", "Red Cherry", "Rich & Smooth", "Roobeer", "Rootbeer", "Rose", "Royal Grape", "Rum", "Rum & Cola", "Rum Honey", "S'Mores", "Safari Melon Dew", "Sahara Mimosa", "Scooby Snack", "Seven Spice", "Smashing pumpkin", "Smugglin' Plums", "Snicker Doodle", "Sour Apple", "Spearmint", "Spiced Apple Cider", "Spiced Rum", "Strawberry", "Strawberry Banana Split", "Strawberry Daiquiri", "Strawberry Kiwi", "Strawberry Lemonade", "Strawberry Margarita", "Sweet Apple", "Sweet Melon", "Sweet Red Melon", "Sweet Tang", "Tangerine", "Tangerine Dream", "Tequila Sunrise", "The Dude", "Triple Apple", "Triple X", "Tropical Explosion", "Tropical Fruit", "Tropical Punch", "Turning Trixx", "Vanilla", "Vanilla Mojito", "Watermelon", "White Grape", "White Peach", "Wild Berry", "Wild Berry Mint", "Wild Mango", "Wild Mint", "Winter Fresh", "Wintergreen", "X-Presso"];

        var flavor1 = flavors[Math.floor(Math.random() * flavors.length)];
        var flavor2 = flavors[Math.floor(Math.random() * flavors.length)];
        while(true) {
          if(flavor2 != flavor1)
            break;
          flavor2 = flavors[Math.floor(Math.random() * flavors.length)];
        }

        var messages = [
          "/me mixes a bowl of " + flavor1 + " and " + flavor2,
          "/me loads a bowl of " + flavor1
        ];

        var ends = [
          "and lights it up.",
          "and lights it up.",
          "and passes the pipe around.",
          "and shares the hose among the people."
        ];
        this.bot.speak(messages[Math.floor(Math.random() * messages.length)] + " " + ends[Math.floor(Math.random() * ends.length)]);
        break;
        
      case 'suicide':
      case 'killself':
        this.bot.speak("/me stabs itself in the face, but forgets it's a robot and can't die. Now it just has a messed up face.");
        break;
        
      case 'bar':
        var rstr = "The bar is ";
        if(this.bartend.activated)
          rstr += "open.";
        else
          rstr += "closed.";
        this.bot.speak(rstr);
        break;
        
      case 'dance':
        //ttBot.vote('up');
        this.bot.speak('bender dance!');
        break;
        
      case 'plays':
        this.bot.pm(this.moderation.getDjCounts.call(global.bartender), userid);
        break;
        
      case 'playsext':
        this.bot.pm(this.moderation.getDjCounts.call(global.bartender, true), userid);
        break;
        
      case 'wait':
        this.bot.pm(this.moderation.getWaitCounts.call(global.bartender), userid);
        break;
        
      case 'setplays':
        if(!this.isMod(userid)) return;
        var count = parseInt(params.substring(params.lastIndexOf(' ') + 1)),
            uname = params.substring(0, params.lastIndexOf(' ')),
            user = this.findUser(uname);
        if(user === null) {
          this.bot.pm('Cound not find ' + uname + ' in the room.', userid);
          return false;
        }
        if(this.moderation.setDjPlaysCount(user.userid, count))
          this.bot.pm(user.name + '\'s play count has been updated to ' + count + '.', userid);
        else
          this.bot.pm('The amount you entered is more than the maximum allowed.', userid);
        break;
        
      case 'setwait':
        if(!this.isMod(userid)) return;
        var count = parseInt(params.substring(params.lastIndexOf(' ') + 1)),
            uname = params.substring(0, params.lastIndexOf(' ')),
            user = this.findUser(uname);
        if(user === null) {
          this.bot.pm('Cound not find ' + uname + ' in the room.', userid);
          return false;
        }
        if(this.moderation.setWaitCount(user.userid, count))
          this.bot.pm(user.name + '\'s wait count has been updated to ' + count + '.', userid);
        else
          this.bot.pm('The amount you entered is more than the maximum allowed.', userid);
        break;
        
      case 'moderation':
        if(!this.isMod(userid)) return;
        if(params == "on")
          this.moderation.activated = true;
        else
          this.moderation.activated = false;
        
        this.bot.pm('Moderation turned ' + ((params == "on") ? 'on' : 'off') + '.', userid);
        break;
        
      case 'queue':
        if(!this.isMod(userid)) return;
        if(params == "on")
          this.queue.activated = true;
        else
          this.queue.activated = false;
        break;
        
      case 'bandj':
        if(!this.isMod(userid)) return;
        var duration = parseInt(params.substring(params.lastIndexOf(' ') + 1)),
            username = params.substring(0, params.lastIndexOf(' ')),
            found = null;
            
        if(duration <= 0) {
          this.bot.pm("Please enter an appropriate durationt to ban; it must be >= 1 hour.", userid);
          return;
        } else if(!username.length) {
          this.bot.pm("Please enter a username to ban.", userid);
          return;
        }
        
        for(var a in this.room.users) {
          if(username.toLowerCase() === this.room.users[a].name.toLowerCase()) {
            found = this.room.users[a].userid;
            break;
          }
        }
        
        if(null === found)
          this.bot.pm("User not found in room.", userid);
        else {
          this.moderation.addDjBan.call(global.bartender, found, username, duration);
          this.bot.pm(username + " added to the banned dj's list for " + duration + " hours.", userid);
        }
        break;
        
      case 'unbandj':
        if(!this.isMod(userid)) return;
        
        if(this.moderation.remDjBan.call(global.bartender, params))
          this.bot.pm(params + " was removed from the banned dj's list.", userid);
        else
          this.bot.pm(params + " was not found.", userid);
        break;
        
      case 'banneddjs':
        this.bot.pm(this.moderation.getBannedDjs.call(global.bartender), userid);
        break;
        
      case 'bannedusers':
        if(!this.isMod(userid)) return;
        this.bot.pm(this.moderation.getBannedUsers(), userid);
        break;
        
      case 'banuser':
        if(!this.isMod(userid)) return;
        var uname = params,
            found = null;

        if(!uname.length) {
          this.bot.pm("Please enter a username to ban.", userid);
          return;
        }
        
        for(var a in this.room.users) {
          if(uname.toLowerCase() === this.room.users[a].name.toLowerCase()) {
            found = this.room.users[a].userid;
            break;
          }
        }
        
        if(null === found)
          this.bot.pm("User, " + uname + ", not found in room.", userid);
        else {
          if(this.moderation.banUser(found, uname))
            this.bot.pm(uname + " has been banned from the room.", userid);
          else
            this.bot.pm(uname + " is already banned from the room.", userid);
        }
        break;
        
      case 'banuserid':
        if(!this.isMod(userid)) return;
        var uid = params;
        if(!uid.length)
          this.bot.pm("Please enter a userid to ban.", userid);
        
        if(this.moderation.banUser(uid, uid))
          this.bot.pm(uid + " has been banned from the room.", userid);
        else
          this.bot.pm(uid + " is already banned from the room.", userid);
        break;
        
      case 'unbanuser':
        if(!this.isMod(userid)) return;
        var uname = params;
        if(this.moderation.unBanUser(null, uname))
          this.bot.pm(uname + " has been UNbanned from the room.", userid);
        else
          this.bot.pm(uname + " was not found.", userid);
        break;
        
      case 'unbanuserid':
        if(!this.isMod(userid)) return;
        var uid = params;
        if(this.moderation.unBanUser(uid))
          this.bot.pm(uid + " has been UNbanned from the room.", userid);
        else
          this.bot.pm(uid + " was not found.", userid);
        break;
    }
  },
  getUptime: function(callback, rtn) {
    var seconds = (new Date() - this.start_time) / 1000;
    var minutes = seconds / 60;
    var hours = minutes / 60;
    var uptime = "";
    if(hours >= 1) {
      hours = Math.round(hours);
      if(hours < 10)
        uptime += "0";
      uptime += "" + hours + ":";
    }
    else
      uptime += "00:";
    
    if(minutes >= 1) {
      minutes = Math.round(minutes % 60);
      if(minutes < 10)
        uptime += "0";
      uptime += "" + minutes + ":";
    }
    else
      uptime += "00:";
    
    if(seconds >= 1) {
      seconds = Math.round(seconds % 60);
      if(seconds < 10)
        uptime += "0";
      uptime += "" + seconds;
    }
    else
      uptime += "00";

    if(undefined === rtn)
      callback("Uptime: " + uptime);
    else
      return "Uptime: " + uptime;
  },
  
  /**
   * Helper Methods
   */
  isInRoom: function(userid) {
    for(var a in this.room.users)
      if(a === userid) return true;
    return false;
  },
  findUser: function(username) {
    for(var a in this.room.users)
      if(this.room.users[a].name === username) return this.room.users[a];
    return null;
  },
  isDj: function(userid) {
    for(var i = 0, l = this.room.djs.length; i < l; i++) {
      if(this.room.djs[i] == userid) return true;
    }
    return false;
  },
  isMod: function(userid) {
    if(this.isSuperMod(userid)) return true;
    var user = this.room.users[userid];
    if(undefined === user) return false;
    for(var i = 0, l = this.room.moderatorList.length; i < l; i++) {
      if(this.room.moderatorList[i] == userid) return true;
    }
    return false;
  },
  isSuperMod: function(userid) {
    var user = this.room.users[userid];
    if(undefined === user) return false;
    return user.acl > 0;
  }
};
global.bartender.init(false); // expose class object
//global.bartender.bot.debug = true;

//repl.start('> ').context.bartender = global.bartender; // allow you to control the bot from the REPL session.


/**
 * Web Service
 */
var http = require('http'),
    url = require('url');
http.createServer(function(req, res) {
  var body = '',
      code = 200,
      params = url.parse(req.url, true);
      
  // determine what page we are on
  switch(params.pathname) {
    case '/':      
      body += '<p>Total Users: ' + Object.keys(global.bartender.room.users).length + '</p>';
      body += '<p>' + global.bartender.getUptime(null, true) + '</p>';
      body += '<p><a href="/restart">Restart Bartender</a></p>';
      break;
      
    case '/restart':
      if(global.bartender.bot !== null || global.bartender.bot !== undefined) {
        global.bartender.bot.close();
        global.bartender.init();
      }
      body += '<p>Bartender restarted. <a href="/">Go back</a>.</p>';
      break;
    
    case '/remove-dnd24':
      if(undefined === params.query || undefined === params.query.rid || params.query.rid.length < 10) {
        code = 400;
        body += 'Please include a roomid.';
      }
      else {
        if(global.botMaster.remove24hourDND(params.query.rid))
          body += '<p>Room found and removed.</p>';
        else
          body += '<p>Room not found on DND-24 List.</p>';
      }
      body += '<p><a href="/">Back</a></p>';
      break;
      
    default:
      code = 404;
      body = '<h1>404 Not Found</h1><p>Could not find resource.</p>';
  }
  
  // write response to user
  res.writeHead(code, { 'Content-Type': "text/html" });
  res.write('<html><head><title>Bartender Bot\'</title></head><body>' + body + '</body></html>');
  res.end();
}).listen(process.env.OPENSHIFT_NODEJS_PORT, process.env.OPENSHIFT_NODEJS_IP);
