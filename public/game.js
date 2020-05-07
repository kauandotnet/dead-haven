// Pointer Globals
var pointerX = 0;
var pointerY = 0;
// Chat Globals
var chatArray = [];
// Bullet Globals
var bullet_array = [];
var npc_bullets = [];
// Zombie Globals
var zombie_array = [];
// NPC Globals
var npc_array = [];
// Object Globals
var object_array = [];
// Layers
var map = [];
// Global layer
var gLayer;
var gLayer2;
var gLayer3;
var gLayer4;
// Global Camera
var gCamera;
// Windows
var windowOpen = "";
// Controls
var controls;
var keySpace;
var keyF;
var keyM;
var keyC;
var keyB;
var keyG;
// User Creation
var username = "";
// Timers
var timerMissionFinish = new Date().getTime() - 1000;
// Last active
var lastActive = new Date().getTime();
// Construction Variables
var constructionMode = false;
var constructionItem = 0;
var constructionMenu = 0;

globalSocket = io();

class mainMenu extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'mainMenu' });
    }

    preload ()
    {
    	this.load.html('login', 'assets/html/login.html');
    	this.load.html('login2', 'assets/html/login2.html');
    	this.load.html('login3', 'assets/html/login3.html');
    	this.load.image('mainMenuImage', 'assets/mainMenuImage.png');
    }

    create ()
    {
    	// Server Stuff
    	var self = this;

    	// Background Image
    	var mainMenuImage = self.add.image(0, 0, 'mainMenuImage').setOrigin(0);

		// Login Object
		// Username
		var element = this.add.dom(303, 333).createFromCache('login');
		// Password
		var element2 = this.add.dom(303, 429).createFromCache('login2');

		// Set variables
		element.setScrollFactor(0);
		element2.setScrollFactor(0);

		// Pointer down action
		this.input.on('pointerdown', function(pointer)
		{
			// Update pointer position for globals
			pointerX = pointer.x;
			pointerY = pointer.y;

			console.log("X: " + pointer.x);
			console.log("Y: " + pointer.y);

			// Login
			if(pointer.x >= 189 && pointer.x <= 414 && pointer.y >= 610 && pointer.y <= 713)
			{
	            var inputText = element.getChildByName('username');
	            //  Have they entered anything?
	            if(inputText.value !== "")
	            {
	            	// Get username
	            	username = inputText.value;

	            	// Clear textbox
	            	inputText.value = "";
	            	// Hide objects
	            	// Go to the main game
	            	self.scene.start('mainGame');
	            }
	            else
	            {
	            	// Do nothing
	            }
			}
		}, this);
    }

    update ()
    {
    	// Do Nothing
    }
}

class mainGame extends Phaser.Scene {

    constructor ()
    {
        super({ key: 'mainGame' });
    }
 
	preload ()
	{
		// Images
		this.load.html('chatbox', 'assets/html/chatbox.html');
		//this.load.image('npc', 'assets/player.png');
		this.load.image('bullet', 'assets/bullet.png');
		this.load.image('group', 'assets/group.png');
		this.load.image('charactermenu', 'assets/charactermenu.png');
		this.load.image('menu', 'assets/Menu.png');
		this.load.image('constructionMenu', 'assets/constructionMenu.png');
		this.load.atlas('zombie', 'assets/zombie_male.png', 'assets/zombie_male.json');
		this.load.image('terrain', 'terrain.png');
		this.load.image('roofwalls', 'roofwalls.png');
		this.load.image('corners', 'corners.png');
		this.load.image('item', 'assets/item.png');
		this.load.tilemapTiledJSON('map', 'test.json');
		this.load.json('animations', 'assets/animations.json');
		// Icons
		this.load.image('guistatus', 'assets/guistatus.png');
		// Load construction windows
		this.load.image('constructionMenu_bed', 'assets/windows/constructionMenu_bed.png');
		this.load.image('constructionMenu_chair', 'assets/windows/constructionMenu_chair.png');
		this.load.image('constructionMenu_couch', 'assets/windows/constructionMenu_couch.png');
		this.load.image('constructionMenu_electronics', 'assets/windows/constructionMenu_electronics.png');
		this.load.image('constructionMenu_plants', 'assets/windows/constructionMenu_plants.png');
		this.load.image('constructionMenu_recliner', 'assets/windows/constructionMenu_recliner.png');
		this.load.image('constructionMenu_tables', 'assets/windows/constructionMenu_tables.png');

		// Player
		this.load.path = 'assets/';
		this.load.multiatlas('player', 'male.json');

		// Sound
		// Gun shot
		this.load.audio('gunshot', [
			'sound/gunshot.ogg',
			'sound/gunshot.mp3'
		]);
	}
	 
	create ()
	{
		var self = this;
		this.socket = globalSocket;
		//this.socket = io();

		// Send Data To Server
		globalSocket.emit('createUser', { id: globalSocket.id, username: username });

		// Load animation data
    	var data = this.cache.json.get('animations');
    	this.anims.fromJSON(data);
		
		this.otherPlayers = this.physics.add.group();
			
	    map = this.make.tilemap({ key: 'map' });

	    // The first parameter is the name of the tileset in Tiled and the second parameter is the key
	    // of the tileset image used when loading the file in preload.
	    var terrain = map.addTilesetImage('terrain', 'terrain');
	    var roofwalls = map.addTilesetImage('roofwalls', 'roofwalls');
	    var corners = map.addTilesetImage('corners', 'corners');

	    // You can load a layer from the map using the layer name from Tiled, or by using the layer
	    // index (0 in this case).
	    var roofLayer = map.createDynamicLayer('Roof', [ terrain, roofwalls, corners ]);
	    var layer = map.createDynamicLayer('Tile Layer 1', [ terrain, roofwalls, corners ]);
	    var floorLayer = map.createDynamicLayer('Floor', [ terrain, roofwalls, corners ]);
	    var terrainLayer = map.createDynamicLayer('Tile Layer 2', [ terrain, roofwalls, corners ]);

	 	// Start collision code
	    //floorLayer.setCollision([ 349 ]);
	    floorLayer.setCollisionBetween(249, 417);
	    //floorLayer.setTileIndexCallback(349, bulletHitObject, this);
	    // End collision code

	    // Set global layer var
	    gLayer = layer;
	    gLayer2 = floorLayer;
	    gLayer3 = roofLayer;
	    gLayer4 = terrainLayer;
	    
	    // Camera
	    
	    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

	    var cursors = this.input.keyboard.createCursorKeys();

	    var controlConfig = {
	        camera: this.cameras.main,
	        left: cursors.left,
	        right: cursors.right,
	        up: cursors.up,
	        down: cursors.down,
	        speed: 0.1
	    };

	    gCamera = this.cameras.main

	    controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);

	    // Pickup GUI
	    var pickupMessage = this.add.text(500, 800, "Press F to pickup the item.", { fontFamily: '"Times New Roman"', color: "white", fontSize: "24px" }).setDepth(1000).setScrollFactor(0);
	    pickupMessage.setVisible(false);
	    config._globals.set("pickupMessage", pickupMessage);

	    // Home GUI
	    var homeMessage = this.add.text(500, 800, "Press B to buy this safehouse.", { fontFamily: '"Times New Roman"', color: "white", fontSize: "24px" }).setDepth(1000).setScrollFactor(0);
	    homeMessage.setVisible(false);
	    config._globals.set("homeMessage", homeMessage);

	    // GUI Status Image
	    var guistatus = this.add.image(1130, 10, 'guistatus').setDepth(1000).setScrollFactor(0).setOrigin(0);
	    guistatus.setVisible(true);
	    config._globals.set("guistatus", guistatus);

	    // Health / Hunger / Thrist GUI
	    var healthMessage = this.add.text(1178, 28, "*LOADING*", { fontFamily: '"Times New Roman"', color: "white", fontSize: "24px" }).setDepth(1000).setScrollFactor(0);
	    healthMessage.setVisible(true);
	    config._globals.set("healthMessage", healthMessage);

	     var hungerMessage = this.add.text(1178, 120, "*LOADING*", { fontFamily: '"Times New Roman"', color: "white", fontSize: "24px" }).setDepth(1000).setScrollFactor(0);
	    hungerMessage.setVisible(true);
	    config._globals.set("hungerMessage", hungerMessage);

	    var thirstMessage = this.add.text(1178, 170, "*LOADING*", { fontFamily: '"Times New Roman"', color: "white", fontSize: "24px" }).setDepth(1000).setScrollFactor(0);
	    thirstMessage.setVisible(true);
	    config._globals.set("thirstMessage", thirstMessage);

	    var moneyMessage = this.add.text(1169, 75, "*LOADING*", { fontFamily: '"Times New Roman"', color: "white", fontSize: "24px" }).setDepth(1000).setScrollFactor(0);
	    moneyMessage.setVisible(true);
	    config._globals.set("moneyMessage", moneyMessage);

	    var groupMessage = this.add.text(600, 10, "*LOADING*", { fontFamily: '"Times New Roman"', color: "blue", fontSize: "24px" }).setDepth(1000).setScrollFactor(0);
	    groupMessage.setVisible(false);
	    config._globals.set("groupMessage", groupMessage);

	    // Mission Finish
	    var missionFinish = this.add.text(300, 300, "You finished the mission!", { fontFamily: '"Times New Roman"', color: "red", fontSize: "48px" }).setDepth(1000).setScrollFactor(0);
	    missionFinish.setVisible(false);
	    config._globals.set("missionFinish", missionFinish);
	    	
		// Keyboard Inputs
		keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
		keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
		keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
		keyC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
		keyB = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
		keyG = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
		
		// Chatbox Object
		var element = this.add.dom(650, 875).createFromCache('chatbox');
		element.setScrollFactor(0);
		element.addListener('click');
		element.setPerspective(800);
		element.on('click', function (event)
		{
	        if(event.target.name === 'sendButton')
	        {
	            var inputText = this.getChildByName('chatmessage');
	            //  Have they entered anything?
	            if(inputText.value !== "")
	            {
	            	// Broadcast to server
	            	self.socket.emit('chatMessage', { id: self.socket.id, chat: inputText.value });
	            	// Update last active
	            	lastActive = new Date().getTime();
	            	// Clear textbox
	            	inputText.value = "";
	            }
	            else
	            {
	            	// Do nothing
	            }
	        }
		});
		
		this.socket.on('currentPlayers', function(players)
		{
			Object.keys(players).forEach(function(id)
			{
				if(players[id].playerId === self.socket.id)
				{
					addPlayer(self, players[id]);
				}
				else
				{
					addOtherPlayers(self, players[id]);
				}
			});
		});
		
		this.socket.on('newPlayer', function(playerInfo)
		{
			addOtherPlayers(self, playerInfo);
		});

		this.socket.on('receiveDialogue', function(data)
		{
			openDialogueScreen(data.spriteid, data.text, data.type, self);
		});

		this.socket.on('npc', function(server_npc_array)
		{
			for(var i = 0; i < server_npc_array.length; i++)
			{
				if(npc_array[i] == undefined)
				{
					// Create NPC
					npc_array[i] = self.add.sprite(server_npc_array[i].x, server_npc_array[i].y, 'player').setOrigin(0.5, 0.3);
					npc_array[i].nameObject = self.add.text(server_npc_array[i].x, server_npc_array[i].y + 100, server_npc_array[i].name, { fontFamily: '"Times New Roman"', color: "white", fontSize: "18px" });
					npc_array[i].spriteid = server_npc_array[i].spriteid;
					npc_array[i].rotation = server_npc_array[i].rotation;
					npc_array[i].angle = server_npc_array[i].angle;
					npc_array[i].isShooting2 = false;

					// Animation
					npc_array[i].anims.play("maleWalk");

					// Animation callback
					npc_array[i].on('animationcomplete', npcAnimComplete, self);

					// Make Interactive
					npc_array[i].setInteractive();

					// Only way to get this within the scope below
					var sId = npc_array[i].spriteid;

					// Action
					// Open dialogue
					npc_array[i].on('pointerdown', function ()
					{		
						self.socket.emit('dialogue', { id: sId });
					}, this);
				}
				else
				{
					// Otherwise, just update it! 
					npc_array[i].x = server_npc_array[i].x; 
					npc_array[i].y = server_npc_array[i].y;
					npc_array[i].nameObject.x = server_npc_array[i].x;
					npc_array[i].nameObject.y = server_npc_array[i].y + 100;
					npc_array[i].rotation = server_npc_array[i].rotation;
					npc_array[i].angle = server_npc_array[i].angle;

					// If NPC is shooting at a zombie, let's start up the animation
					if(server_npc_array[i].isShooting >= 0)
					{
						// Prevent a bug, otherwise the NPC will keep shooting
						if(server_npc_array[i].isShooting == false) return;

						// If not playing the shooting animation
						if(!npc_array[i].isShooting2)
						{
							npc_array[i].anims.play("maleShoot");
							npc_array[i].isShooting2 = true;
						}
					}
				}
			}
		});

		this.socket.on('getGroupInv', function(group)
		{
			if(group.do == 0)
			{
				// Set the player in a group
				self.player.inGroup = 1;
				self.player.groupId = group.groupId;

				// Send interface to confirm, if the receiving player
				if(self.socket.id == group.receiver)
				{
					confirmGroupInv(group.sender, group.senderName, self);
				}
			}

			// Leave Group Request
			if(self.player.groupId == group.groupId && group.do == 1)
			{
				self.player.inGroup = 0;
				self.player.groupId = 0;
			}
		});

		this.socket.on('receiveObjects', function(data)
		{
			switch(data.myObjects.object)
			{
				// Chair
				case 1:
					var sprite = self.add.sprite(data.myObjects.x, data.myObjects.y, 'zombie');
				break;
			}
		});
		
		this.socket.on('disconnect', function(playerId)
		{
			self.otherPlayers.getChildren().forEach(function(otherPlayer)
			{
				if(playerId === otherPlayer.playerId)
				{
					otherPlayer.nameObject.destroy();
					otherPlayer.zombie.destroy();
					otherPlayer.destroy();
				}
			});
		});

		this.socket.on('force-disconnect', function(playerInfo)
		{
			// We will force the user to go back to the main menu here
		});

		// Teleports the player to the coordinates
		this.socket.on('teleportMove', function(playerInfo)
		{
			if(playerInfo.playerId == self.socket.id)
			{
				self.player.setPosition(playerInfo.x, playerInfo.y);
			}
			else
			{
				self.otherPlayers.getChildren().forEach(function(otherPlayer)
				{
					if(playerInfo.playerId === otherPlayer.playerId)
					{
						// Other player position
						otherPlayer.setRotation(playerInfo.rotation);
						otherPlayer.setPosition(playerInfo.x, playerInfo.y);
						// Other player zombie position
						otherPlayer.zombie.setRotation(playerInfo.rotation);
						otherPlayer.zombie.setPosition(playerInfo.x, playerInfo.y);
						// Other player name text position
						otherPlayer.nameObject.x = playerInfo.x;
						otherPlayer.nameObject.y = playerInfo.y + 100;
						
						// Show chat bubble for player and update position
						var myChatArrayN = [];
					
						for(var i = 0; i <= chatArray.length - 1; i++)
						{
							if(chatArray[i].playerID === otherPlayer.playerId)
							{
								chatArray[i].x = playerInfo.x;
								chatArray[i].y = playerInfo.y - 32;
								myChatArrayN.push(chatArray[i]);
						
								for(var j = 0; j <= myChatArrayN.length - 1; j++)
								{
									myChatArrayN[(myChatArrayN.length - 1) - j].y = playerInfo.y - (32 * (j + 2));
								}
							}
						}
					}
				});
			}
		});

		this.socket.on('playerMoved', function(playerInfo)
		{
			self.otherPlayers.getChildren().forEach(function(otherPlayer)
			{
				if(playerInfo.playerId === otherPlayer.playerId)
				{
					// Other player position
					otherPlayer.setRotation(playerInfo.rotation);
					otherPlayer.setPosition(playerInfo.x, playerInfo.y);
					// Other player zombie position
					otherPlayer.zombie.setRotation(playerInfo.rotation);
					otherPlayer.zombie.setPosition(playerInfo.x, playerInfo.y);
					// Other player name text position
					otherPlayer.nameObject.x = playerInfo.x;
					otherPlayer.nameObject.y = playerInfo.y + 100;
					
					// Show chat bubble for player and update position
					var myChatArrayN = [];
				
					for(var i = 0; i <= chatArray.length - 1; i++)
					{
						if(chatArray[i].playerID === otherPlayer.playerId)
						{
							chatArray[i].x = playerInfo.x;
							chatArray[i].y = playerInfo.y - 32;
							myChatArrayN.push(chatArray[i]);
					
							for(var j = 0; j <= myChatArrayN.length - 1; j++)
							{
								myChatArrayN[(myChatArrayN.length - 1) - j].y = playerInfo.y - (32 * (j + 2));
							}
						}
					}
				}
			});
		});
		
		// Listen for any player hit events and make that player flash 
		this.socket.on('player-hit',function(playerInfo)
		{
			if(playerInfo.playerId == self.socket.id)
			{
				// If this is you
				self.player.setTint("0xff0000");
			}
			else
			{
				// Find the right player
				self.otherPlayers.getChildren().forEach(function(otherPlayer)
				{
					if(playerInfo.playerId === otherPlayer.playerId)
					{
						otherPlayer.setTint("0xff0000");
					}
				});
			}
		});

		// Listen for server advising player is over an object
		this.socket.on('player-on-object',function(playerInfo)
		{
			if(playerInfo.player.playerId == self.socket.id)
			{
				if(playerInfo.home == 0)
				{
					// If this is you, set message as visible
					config._globals.get("pickupMessage").setVisible(true);
					config._globals.get("homeMessage").setVisible(false);
				}
				else
				{
					config._globals.get("homeMessage").setVisible(true);
					config._globals.get("pickupMessage").setVisible(false);
				}
			}

			// Update all players
			updatePlayers(playerInfo.player, self);
		});

		// Listen for server advising player finished a mission
		this.socket.on('mission-finish',function(playerInfo)
		{
			var now = new Date().getTime();
			timerMissionFinish = now + 2000;
		});

		// Listen for server advising player is not over an object
		this.socket.on('player-off-object',function(playerInfo)
		{
			if(playerInfo.playerId == self.socket.id)
			{
				// If this is you, set message as not visible
				config._globals.get("pickupMessage").setVisible(false);
				config._globals.get("homeMessage").setVisible(false);
			}

			// Update all players
			updatePlayers(playerInfo, self);
		});
		
		// Player shot zombie
		this.socket.on('zombie-hit', function(zombie)
		{
			// Find the right zombie
			for(var i = 0; i < zombie_array.length; i++)
			{
				if(zombie_array[i] != undefined)
				{
					if(i == zombie)
					{
						zombie_array[i].destroy();
						zombie_array.splice(i, 1);
						break;
					}
				}
			}
		});
		
		// Send Map to server
		this.socket.on('sendMap', function(data)
		{	
			/*if(zombie_array.length > 0)
			{
				var sendArray = [];
				// Get the map area
				for(x = zombie_array[data].x - 10; x < zombie_array[data].x + 10; x++)
				{
					for(y = zombie_array[data].y - 10; y < zombie_array[data].y + 10; y++)
					{
						var tileX = map.worldToTileX(x);
						var tileY = map.worldToTileY(y);
						var tileType = map.getTileAt(tileX, tileY);
						sendArray.push(tileType.index);
					}
				}
				self.socket.emit('mapInfo', { data: sendArray });
			}*/
		});
		
		this.socket.on('chatMessage', function(chatV)
		{
			addTextBubble(chatV.chatV.id, 100, 100, chatV.chatV.chat, self);
		});

		this.socket.on('destroyItem', function(item)
		{
			object_array[item.item.item].destroy();
			object_array.splice(item.item.item, 1);
			fixObjectArray(item.item.item);
		});
		
		this.socket.on('bullet', function(server_bullet_array)
		{
			/*if(bulletArray[data.data.spriteid].x > 700)
			{
				bulletArray[data.data.spriteid].destroy();
				bulletArray.splice(data.data.spriteid, 1);
				console.log(data.data.spriteid);
				
				for(i = 0; i <= data.data.spriteid; i++)
				{
					console.log("a" + i);
					bulletArray[i].bulletID -= 1;
				}
			}
			else
			{
				bulletArray[data.data.spriteid].y = data.data.y;
				bulletArray[data.data.spriteid].x = data.data.x;
				self.socket.emit('bullet', { id: data.data.id, spriteid: data.data.spriteid, x: data.data.x, y: data.data.y, angle: data.data.angle });
			}*/
			//console.log(bulletArray);
			for(var i = 0; i < server_bullet_array.length; i++)
			{
				if(bullet_array[i] == undefined)
				{
					bullet_array[i] = self.physics.add.sprite(server_bullet_array[i].x, server_bullet_array[i].y, 'bullet').setOrigin(0, 0);
					self.physics.add.overlap(bullet_array[i], gLayer);
					// Play gun shot
					var sound = self.sound.add('gunshot').play();
				}
				else
				{
					// Otherwise, just update it! 
					bullet_array[i].x = server_bullet_array[i].x; 
					bullet_array[i].y = server_bullet_array[i].y;
				}
			}
			
			// Otherwise if there's too many, delete the extra 
			for(var i = server_bullet_array.length; i < bullet_array.length; i++)
			{
				bullet_array[i].destroy();
				bullet_array.splice(i, 1);
				i--;
			}
		});

		this.socket.on('npcBullet', function(server_bullet_array)
		{
			for(var i = 0; i < server_bullet_array.length; i++)
			{
				if(npc_bullets[i] == undefined)
				{
					npc_bullets[i] = self.physics.add.sprite(server_bullet_array[i].x, server_bullet_array[i].y, 'bullet').setOrigin(0, 0);
					self.physics.add.overlap(npc_bullets[i], gLayer);
					// Play gun shot
					var sound = self.sound.add('gunshot').play();
				}
				else
				{
					// Otherwise, just update it! 
					npc_bullets[i].x = server_bullet_array[i].x; 
					npc_bullets[i].y = server_bullet_array[i].y;
				}
			}
			
			// Otherwise if there's too many, delete the extra 
			for(var i = server_bullet_array.length; i < npc_bullets.length; i++)
			{
				npc_bullets[i].destroy();
				npc_bullets.splice(i, 1);
				i--;
			}
		});
		
		this.socket.on('zombie', function(server_zombie_array)
		{
			for(var i = 0; i < server_zombie_array.length; i++)
			{
				if(zombie_array[i] == undefined)
				{
					zombie_array[i] = self.physics.add.sprite(server_zombie_array[i].x, server_zombie_array[i].y, 'zombie').setOrigin(0.5, 0.7);
					zombie_array[i].spriteid = server_zombie_array[i].spriteid;
					zombie_array[i].rotation = server_zombie_array[i].rotation;
					zombie_array[i].angle = server_zombie_array[i].angle;
					zombie_array[i].anims.play("zWalk");
					zombie_array[i].overlapAdded = false;
					zombie_array[i].isAttacking = false;
					zombie_array[i].on('animationcomplete', zombieAnimComplete, self);
				}
				else
				{
					// For attack animation because player shows as undefined on start up
					if(!zombie_array[i].overlapAdded && self.player != undefined)
					{
						self.physics.add.overlap(zombie_array[i], self.player, attackAnimation, null, self);
						zombie_array[i].overlapAdded = true;
					}

					// Otherwise, just update it! 
					zombie_array[i].x = server_zombie_array[i].x; 
					zombie_array[i].y = server_zombie_array[i].y;
					zombie_array[i].rotation = server_zombie_array[i].rotation;
					zombie_array[i].angle = server_zombie_array[i].angle;
				}
			}
		});

		this.socket.on('object', function(server_object_array)
		{
			for(var i = 0; i < server_object_array.length; i++)
			{
				if(object_array[i] == undefined)
				{
					object_array[i] = self.physics.add.sprite(server_object_array[i].x, server_object_array[i].y, 'item');
					object_array[i].spriteid = server_object_array[i].spriteid;
					object_array[i].itemType = server_object_array[i].itemType;
				}
				else
				{
					// Otherwise, just update it! 
					object_array[i].x = server_object_array[i].x; 
					object_array[i].y = server_object_array[i].y;
				}
			}
		});
		
		// Add controls
		this.cursors = this.input.keyboard.createCursorKeys();

		// Moving the cursor around action
		this.input.on('pointermove', function(pointer)
		{
			// Update pointer position for globals
			pointerX = pointer.x;
			pointerY = pointer.y;
			// Update last active
			lastActive = new Date().getTime();
		}, this);

		// Pointer down action
		this.input.on('pointerdown', function(pointer)
		{
			// Update pointer position for globals
			pointerX = pointer.x;
			pointerY = pointer.y;
			// Update last active
			lastActive = new Date().getTime();

			console.log("X: " + pointer.x);
			console.log("Y: " + pointer.y);

			// Construction Code
			//if(constructionMode)
			//{
				self.socket.emit('buildObject', { object: constructionItem, x: pointerX, y: pointerY });
				// Reset construction
				constructionItem = 0;
				constructionMode = false;
			//}
		}, this);
	}
	 
	update (time, delta)
	{
		if(this.player)
		{
			// Camera
			controls.update(delta);

			// Mission finish timer
			var now = new Date().getTime();
			if(now < timerMissionFinish)
			{
				config._globals.get("missionFinish").setVisible(true);
			}
			else
			{
				config._globals.get("missionFinish").setVisible(false);
			}
			
			// Emit player movement
			var x = this.player.x;
			var y = this.player.y;
			var rotation = this.player.rotation;
			if(this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y || rotation !== this.player.oldPosition.rotation))
			{
				this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y, rotation: this.player.rotation, isMoving: this.player.isMoving });
			}

			// save old position data
			this.player.oldPosition = {
				x: this.player.x,
				y: this.player.y,
				rotation: this.player.rotation
			};

			let currentPoint = new Phaser.Geom.Point(this.player.x, this.player.y);
			let pointToMoveTo = new Phaser.Geom.Point(pointerX + gCamera.scrollX, pointerY + gCamera.scrollY);
			this.player.rotation = Phaser.Math.Angle.BetweenPoints(currentPoint, pointToMoveTo);
			this.player.rotation -= 1.6;

			this.player.body.setVelocity(0);

			// Is the player actively moving the character
			var isMoving = false;
			
			// Control player
			if(this.cursors.left.isDown)
			{
				this.player.body.setVelocityX(-200);
				lastActive = new Date().getTime();
				isMoving = true;
			}
			if(this.cursors.right.isDown)
			{
				this.player.body.setVelocityX(200);
				lastActive = new Date().getTime();
				isMoving = true;
			}
			if(this.cursors.up.isDown)
			{
				this.player.body.setVelocityY(-200);
				lastActive = new Date().getTime();
				isMoving = true;
			}
			if(this.cursors.down.isDown)
			{
				this.player.body.setVelocityY(200);
				lastActive = new Date().getTime();
				isMoving = true;
			}

			if(!isMoving)
			{
				// Player isn't shooting
				if(!this.player.isShooting)
				{
					this.player.anims.stop();
					this.player.zombie.anims.stop();
				}
				this.player.isMoving = false;
			}
			else
			{
				if(!this.player.isMoving)
				{
					this.player.anims.play("maleWalk");
					this.player.zombie.anims.play("zWalk");
					this.player.isMoving = true;
				}
			}

			// Set zombie
			this.player.zombie.x = this.player.x;
			this.player.zombie.y = this.player.y;
			this.player.zombie.rotation = this.player.rotation;
			this.player.nameObject.x = this.player.x;
			this.player.nameObject.y = this.player.y + 100;

			// Other keys
			if(keySpace.isDown)
			{
				// Spawn bullet at player gun
				var rotatedX = Math.cos(this.player.rotation) * ((this.player.x - 10) - this.player.x) - Math.sin(this.player.rotation) * ((this.player.y + 90) - this.player.y) + this.player.x;
            	var rotatedY = Math.sin(this.player.rotation) * ((this.player.x - 10) - this.player.x) + Math.cos(this.player.rotation) * ((this.player.y + 90) - this.player.y) + this.player.y;

				shootBullet(this.socket.id, rotatedX, rotatedY, this.player.angle, this);

				// If not playing the shooting animation...
				if(!this.player.isShooting)
				{
					// Do animation
					this.player.anims.play("maleShoot");
					this.player.isShooting = true;
				}

				lastActive = new Date().getTime();
			}

			if(keyG.isDown)
			{
				// Set the client up for construction mode
				if(constructionMode)
				{
					constructionMode = false;
				}
				else
				{
					openConstructionWindow(this);
					constructionMode = true;
				}

				lastActive = new Date().getTime();
			}

			// Pickup item button
			if(keyF.isDown)
			{
				if(config._globals.get("pickupMessage").visible)
				{
					// Send data to server that the player has pressed the F button to pick up an item
					this.socket.emit('pickupItem', { x: this.player.x, y: this.player.y, item: config._globals.get("pickupMessage").itemId });
				}
				lastActive = new Date().getTime();
			}

			// Buy house button
			if(keyB.isDown)
			{
				if(config._globals.get("homeMessage").visible)
				{
					// Send data to server that the player has pressed the B button to buy an item
					this.socket.emit('buyHouse', { x: this.player.x, y: this.player.y });
				}
				lastActive = new Date().getTime();
			}

			// Mission window
			if(keyM.isDown)
			{
				if(windowOpen == "")
				{
					openMissionWindow(this);
				}
				lastActive = new Date().getTime();
			}

			// View your own character window
			if(keyC.isDown)
			{
				if(windowOpen == "")
				{
					openCharacterScreen(this.player, this);
				}
				lastActive = new Date().getTime();
			}
			
			// Show chat bubble for player and update position
			if(chatArray.length > 0)
			{
				var myChatArray = [];
				
				for(var i = 0; i <= chatArray.length - 1; i++)
				{
					if(chatArray[i].playerID === this.socket.id)
					{
						chatArray[i].x = this.player.x;
						chatArray[i].y = this.player.y - 32;
						myChatArray.push(chatArray[i]);
						
						for(var j = 0; j <= myChatArray.length - 1; j++)
						{
							myChatArray[(myChatArray.length - 1) - j].y = this.player.y - (32 * (j + 2));
							
							if(myChatArray[j].created < new Date().getTime())
							{
								myChatArray[j].destroy();
								myChatArray.splice(j, 1);
							}
						}
					}
				}
				
				// Check if chat bubble needs to be destroyed
				for(var i = 0; i <= chatArray.length - 1; i++)
				{				
					if(chatArray[i].created < new Date().getTime())
					{
						chatArray[i].destroy();
						chatArray.splice(i, 1);
					}
				}
			}

			// Object collision
			for(var i = 0; i < object_array.length; i++)
			{
				var dx = this.player.x - object_array[i].x; 
				var dy = this.player.y - object_array[i].y;
				var dist = Math.sqrt(dx * dx + dy * dy);

				// Determine distance
				if(dist < 70)
				{
					config._globals.get("pickupMessage").itemId = object_array[i].spriteid;
				}
			}
		}
	}
}

// Add self to game
function addPlayer(self, playerInfo)
{
	self.player = self.physics.add.sprite(630, 279, 'player').setOrigin(0.5, 0.3);
	self.cameras.main.startFollow(self.player);
	self.physics.add.collider(self.player, gLayer);
	self.physics.add.collider(self.player, gLayer2);
	self.physics.add.collider(self.player, gLayer3);
	self.physics.add.collider(self.player, gLayer4);
	zombie_sprite = self.add.sprite(400, 300, 'zombie').setOrigin(0.5, 0.7);
	zombie_sprite.setVisible(false);
	self.player.zombie = zombie_sprite;
	self.player.isMoving = false;
	self.player.isShooting = false;
	self.player.nameObject = self.add.text(self.player.x, self.player.y + 100, username, { fontFamily: '"Times New Roman"', color: "white", fontSize: "18px" });
	self.player.anims.play("maleWalk");
	// Set bounds for collision
	self.player.setSize(144, 173).setOffset(190, 50);
	// Animation callback
	self.player.on('animationcomplete', playerAnimComplete, self);
}

// Bullet hit an object
function bulletHitObject()
{
	console.log("Hit!");
}

// Add other players to game
function addOtherPlayers(self, playerInfo)
{
	// Create Other Player
	const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'player').setOrigin(0.5, 0.3);
	otherPlayer.playerId = playerInfo.playerId;
	zombie_sprite = self.add.sprite(400, 300, 'zombie').setOrigin(0.5, 0.7);
	zombie_sprite.setVisible(false);
	otherPlayer.zombie = zombie_sprite;
	otherPlayer.nameObject = self.add.text(playerInfo.x, playerInfo.y + 100, playerInfo.username, { fontFamily: '"Times New Roman"', color: "white", fontSize: "18px" });
	self.otherPlayers.add(otherPlayer);
	// Set Frame
	otherPlayer.setFrame("Walk_gun_000.png");
	// Update other values
	otherPlayer.xp = playerInfo.xp;
	otherPlayer.health = playerInfo.health;
	otherPlayer.hunger = playerInfo.hunger;
	otherPlayer.thirst = playerInfo.thirst;
	otherPlayer.money = playerInfo.money;
	otherPlayer.username = playerInfo.username;
	otherPlayer.isShooting = false;
	otherPlayer.isShootingGoing = false;

	// Animation callback
	otherPlayer.on('animationcomplete', otherPlayerAnimComplete, self);


	// Make Interactive
	otherPlayer.setInteractive();

	// Action
	// Open character screen when player presses on other player
	otherPlayer.on('pointerdown', function ()
	{		
		openCharacterScreen(otherPlayer, self);
	}, this);
}

// addTextBubble: Chat bubbles for players talking
function addTextBubble(id, x, y, message, parentL)
{
	var text = parentL.add.text(x, y, message, { fontFamily: '"Times New Roman"', color: "yellow" }).setDepth(100);
	text.playerID = id;
	text.created = new Date().getTime() + 5000;
	chatArray.push(text);
}

// Corrects the ids in object array after deletion
function fixObjectArray(index)
{
	for(var i = index; i < object_array.length; i++)
	{
		object_array[i].spriteid = object_array[i].spriteid - 1;
	}
}

function updatePlayers(player, parentL)
{
	// Update only the player client
	if(parentL.socket.id === player.playerId)
	{
		// Keep values up to date
		parentL.player.isZombie = player.isZombie;
		parentL.player.inGroup = player.inGroup;
		parentL.player.groupId = player.groupId;
		parentL.player.health = player.health;
		parentL.player.hunger = player.hunger;
		parentL.player.thirst = player.thirst;
		parentL.player.money = player.money;
		parentL.player.missionId = player.missionId;
		parentL.player.missionStatus = player.missionStatus;
		parentL.player.xp = player.xp;
		parentL.isMoving = player.isMoving;
		parentL.isShooting = player.isShooting;

		config._globals.get("healthMessage").setText("" + player.health);
		config._globals.get("hungerMessage").setText("" + player.hunger);
		config._globals.get("thirstMessage").setText("" + player.thirst);
		config._globals.get("moneyMessage").setText("" + numberWithCommas(player.money));

		// Hide GUI if player is a zombie
		if(player.isZombie > 0)
		{
			config._globals.get("healthMessage").setVisible(false);
			config._globals.get("hungerMessage").setVisible(false);
			config._globals.get("thirstMessage").setVisible(false);
			config._globals.get("moneyMessage").setVisible(false);
			config._globals.get("guistatus").setVisible(false);
		}
		else
		{
			config._globals.get("healthMessage").setVisible(true);
			config._globals.get("hungerMessage").setVisible(true);
			config._globals.get("thirstMessage").setVisible(true);
			config._globals.get("moneyMessage").setVisible(true);
			config._globals.get("guistatus").setVisible(true);
		}

		// Zombie animation for self
		if(player.isZombie == 1)
		{
			parentL.player.zombie.setVisible(true);
			parentL.player.setVisible(false);
		}
		// Turn back player into a human after respawn
		else if(player.isZombie == 0)
		{
			parentL.player.zombie.setVisible(false);
			parentL.player.setVisible(true);
		}

		// Group Code
		if(player.inGroup == 0)
		{
			config._globals.get("groupMessage").setText("");
			config._globals.get("groupMessage").setVisible(false);
		}
		else if(player.inGroup > 1)
		{
			config._globals.get("groupMessage").setText("You are in a group.");
			config._globals.get("groupMessage").setVisible(true);
		}
		// End Group Code

		// Send when player was last active
		parentL.socket.emit('getLastActive', { lastActive: lastActive, isMoving: parentL.player.isMoving, isShooting: parentL.player.isShooting });
	}

	// Zombie animation for other players
	if(parentL.socket.id != player.playerId)
	{
		parentL.otherPlayers.getChildren().forEach(function(otherPlayer)
		{
			if(player.playerId === otherPlayer.playerId)
			{
				if(player.isZombie > 0)
				{
					// Show zombie / Hide player
					otherPlayer.zombie.setVisible(true);
					otherPlayer.setVisible(false);
					// Adjust zombie rotation towards player
					var angleC = otherPlayer.rotation;
					otherPlayer.zombie.setRotation(angleC);
				}
				// Turn back into a human after respawn
				else if(player.isZombie == 0)
				{
					otherPlayer.zombie.setVisible(false);
					otherPlayer.setVisible(true);
				}

				// Update other values
				otherPlayer.xp = player.xp;
				otherPlayer.health = player.health;
				otherPlayer.hunger = player.hunger;
				otherPlayer.thirst = player.thirst;
				otherPlayer.money = player.money;
				otherPlayer.inGroup = player.inGroup;
				otherPlayer.groupId = player.groupId;
				otherPlayer.username = player.username;
				otherPlayer.isShooting = player.isShooting;

				// If shooting and animation isn't going
				if(otherPlayer.isShooting && !otherPlayer.isShootingGoing)
				{
					otherPlayer.anims.play("maleShoot");
					otherPlayer.isShootingGoing = true;
				}

				// Animate other player?
				if(!otherPlayer.isMoving)
				{
					if(player.isMoving)
					{
						otherPlayer.isMoving = player.isMoving;
						otherPlayer.anims.play("maleWalk");
						otherPlayer.zombie.anims.play("zWalk");
					}
				}
				else
				{
					if(!player.isMoving)
					{
						otherPlayer.anims.stop();
						otherPlayer.zombie.anims.stop();
						otherPlayer.isMoving = player.isMoving;
					}
				}
			}
		});
	}
}

// Open character screen window
function openCharacterScreen(who, parentL)
{
	if(windowOpen == "")
	{
		// Image
		var menu = parentL.add.sprite(150, 100, 'charactermenu').setOrigin(0, 0).setScrollFactor(0);

		// If not assigned, this is the player
		if(who.username == undefined)
		{
			who.username = username;
		}

		// Window Stuff
		windowOpen = "characterScreen";
		var exitButton = parentL.add.text(475, 645, "[Close]", { fontFamily: '"Times New Roman"', color: "red", fontSize: "24px" }).setDepth(9999).setScrollFactor(0);
		var exitButton2 = parentL.add.text(710, 645, "[Close]", { fontFamily: '"Times New Roman"', color: "red", fontSize: "24px" }).setDepth(9999).setScrollFactor(0);
		var characterScreenText1 = parentL.add.text(510, 135, who.username, { fontFamily: '"Times New Roman"', color: "black", fontSize: "34px" }).setDepth(9999).setScrollFactor(0);
		var characterScreenText2 = parentL.add.text(280, 230, "XP: " + who.xp, { fontFamily: '"Times New Roman"', color: "orange", fontSize: "34px" }).setDepth(9999).setScrollFactor(0);
		var characterScreenText3 = parentL.add.text(280, 290, "Health: " + who.health, { fontFamily: '"Times New Roman"', color: "orange", fontSize: "34px" }).setDepth(9999).setScrollFactor(0);
		var characterScreenText4 = parentL.add.text(280, 350, "Hunger: " + who.hunger, { fontFamily: '"Times New Roman"', color: "orange", fontSize: "34px" }).setDepth(9999).setScrollFactor(0);
		var characterScreenText5 = parentL.add.text(280, 410, "Thirst: " + who.thirst, { fontFamily: '"Times New Roman"', color: "orange", fontSize: "34px" }).setDepth(9999).setScrollFactor(0);
		var characterScreenText6 = parentL.add.text(280, 470, "Money: " + who.money, { fontFamily: '"Times New Roman"', color: "orange", fontSize: "34px" }).setDepth(9999).setScrollFactor(0);
		var characterScreenText7 = parentL.add.text(280, 530, "[Invite to Group]", { fontFamily: '"Times New Roman"', color: "orange", fontSize: "34px" }).setDepth(9999).setScrollFactor(0);

		// Set Interactive
		exitButton.setInteractive();
		exitButton2.setInteractive();
		characterScreenText7.setInteractive();

		// Prevent own player from seeing invite to group
		if(who == parentL.player)
		{
			characterScreenText7.setVisible(false);
		}

		// Set Globals
		config._globals.set("exitButton", exitButton);
		config._globals.set("exitButton2", exitButton2);
		config._globals.set("characterScreenText1", characterScreenText1);
		config._globals.set("characterScreenText2", characterScreenText2);
		config._globals.set("characterScreenText3", characterScreenText3);
		config._globals.set("characterScreenText4", characterScreenText4);
		config._globals.set("characterScreenText5", characterScreenText5);
		config._globals.set("characterScreenText6", characterScreenText6);
		config._globals.set("characterScreenText7", characterScreenText7);
		config._globals.set("menu", menu);

		// Group Code
		if(parentL.player.inGroup > 0)
		{
			characterScreenText7.setText("[Leave Group]");
		}
		// End Group Code

		// Action
		// Exit Button
		exitButton.on('pointerdown', function ()
		{		
			closeAllWindows();
		}, this);

		// Exit Button 2
		exitButton2.on('pointerdown', function ()
		{		
			closeAllWindows();
		}, this);

		// Group Button
		characterScreenText7.on('pointerdown', function ()
		{
			closeAllWindows();
			parentL.socket.emit('receiveGroupInv', { sender: parentL.socket.id, sendTo: who.playerId });

			// Reset player group
			if(parentL.player.inGroup > 0)
			{
				parentL.player.inGroup = 0;
				parentL.player.groupId = 0;
			}
		}, this);
	}
}

function confirmGroupInv(sender, senderName, parentL)
{
	if(windowOpen == "")
	{
		// Image
		var group = parentL.add.image(200, 300, 'group').setOrigin(0).setScrollFactor(0);

		// Window Stuff
		windowOpen = "confirmGroupInv";
		var groupScreen1 = parentL.add.text(500, 450, "**Join Group With " + senderName + "**", { fontFamily: '"Times New Roman"', color: "orange" }).setDepth(9999).setScrollFactor(0);

		// Set Interactive
		group.setInteractive();

		// Set Globals
		config._globals.set("groupScreen1", groupScreen1);
		config._globals.set("group", group);

		// Action
		group.on('pointerdown', function (pointer)
		{
			// Yes
			if(pointer.x >= 274 && pointer.x <= 569 && pointer.y >= 351 && pointer.y <= 434)
			{
				parentL.socket.emit('confirmGroupInv', { answer: true, sender: sender, receiver: parentL.socket.id });
				closeAllWindows();
			}

			// No
			if(pointer.x >= 656 && pointer.x <= 957 && pointer.y >= 351 && pointer.y <= 434)
			{
				parentL.socket.emit('confirmGroupInv', { answer: false, sender: sender, receiver: parentL.socket.id });
				parentL.player.inGroup = 0;
				parentL.player.groupId = 0;
				closeAllWindows();
			}
		}, this);
	}
}

// Close all windows
function closeAllWindows()
{
	// Character Screen Window
	if(windowOpen == "characterScreen")
	{
		config._globals.get("exitButton").destroy();
		config._globals.get("exitButton2").destroy();
		config._globals.get("characterScreenText1").destroy();
		config._globals.get("characterScreenText2").destroy();
		config._globals.get("characterScreenText3").destroy();
		config._globals.get("characterScreenText4").destroy();
		config._globals.get("characterScreenText5").destroy();
		config._globals.get("characterScreenText6").destroy();
		config._globals.get("characterScreenText7").destroy();
		config._globals.get("menu").destroy();
	}

	// Group Screen Window
	if(windowOpen == "confirmGroupInv")
	{
		config._globals.get("groupScreen1").destroy();
		config._globals.get("group").destroy();
	}

	// Dialogue Screen Window
	if(windowOpen == "dialogueScreen")
	{
		config._globals.get("menu").destroy();
		config._globals.get("dialogueScreenText").destroy();
		config._globals.get("dialogueScreenAccept").destroy();
		config._globals.get("dialogueScreenDecline").destroy();
		config._globals.get("dialogueScreenOk").destroy();
		config._globals.get("npcName").destroy();
	}

	// Mission Screen Window
	if(windowOpen == "missionWindow")
	{
		config._globals.get("exitButton").destroy();
		config._globals.get("missionScreenText").destroy();
	}

	// Construction Window
	if(windowOpen == "constructionWindow")
	{
		config._globals.get("menu").destroy();
		config._globals.get("exitButton").destroy();
		config._globals.get("constructionText1").destroy();
		config._globals.get("constructionText2").destroy();
		config._globals.get("constructionText3").destroy();
		config._globals.get("constructionText4").destroy();
		config._globals.get("constructionText5").destroy();
		config._globals.get("constructionText6").destroy();
		config._globals.get("constructionText7").destroy();
	}

	// Construction Windows

	if(windowOpen == "constructionMenu_bed")
	{
		config._globals.get("constructionMenu").destroy();
	}

	if(windowOpen == "constructionMenu_chair")
	{
		config._globals.get("constructionMenu").destroy();
	}

	if(windowOpen == "constructionMenu_couch")
	{
		config._globals.get("constructionMenu").destroy();
	}

	if(windowOpen == "constructionMenu_electronics")
	{
		config._globals.get("constructionMenu").destroy();
	}

	if(windowOpen == "constructionMenu_plants")
	{
		config._globals.get("constructionMenu").destroy();
	}

	if(windowOpen == "constructionMenu_recliner")
	{
		config._globals.get("constructionMenu").destroy();
	}

	if(windowOpen == "constructionMenu_tables")
	{
		config._globals.get("constructionMenu").destroy();
	}

	// End construction windows

	// Clear windowOpen
	windowOpen = "";
}

// openDialogueScreen: id - the id of the NPC, parentL - parent
function openDialogueScreen(id, text, type, parentL)
{
	if(windowOpen == "")
	{
		// Image
		var menu = parentL.add.sprite(150, 100, 'charactermenu').setOrigin(0, 0).setScrollFactor(0);

		// NPC Name

		var npcNameText = "";

		switch(id)
		{
			case 0:
				npcNameText = "Bob";
			break;

			case 1:
				npcNameText = "Matt";
			break;
		}

		// Window Stuff
		windowOpen = "dialogueScreen";
		var npcName = parentL.add.text(510, 135, npcNameText, { fontFamily: '"Times New Roman"', color: "black", fontSize: "34px" }).setDepth(9999).setScrollFactor(0);
		var dialogueScreenText = parentL.add.text(275, 250, text, { fontFamily: '"Times New Roman"', color: "orange", fontSize: "24px" }).setDepth(9999).setScrollFactor(0);
		var dialogueScreenAccept = parentL.add.text(470, 645, "[ACCEPT]", { fontFamily: '"Times New Roman"', color: "orange", fontSize: "18px" }).setDepth(9999).setScrollFactor(0);
		var dialogueScreenDecline = parentL.add.text(703, 645, "[DECLINE]", { fontFamily: '"Times New Roman"', color: "orange", fontSize: "18px" }).setDepth(9999).setScrollFactor(0);
		var dialogueScreenOk = parentL.add.text(475, 645, "[OK]", { fontFamily: '"Times New Roman"', color: "orange", fontSize: "18px" }).setDepth(9999).setScrollFactor(0);

		console.log(type);
		// What kind of dialogue is this?
		// OK
		if(type == 0)
		{
			dialogueScreenAccept.setVisible(false);
			dialogueScreenDecline.setVisible(false);
		}
		// Accept / Decline
		else if(type == 1)
		{
			dialogueScreenOk.setVisible(false);
		}

		// Set Interactive
		dialogueScreenAccept.setInteractive();
		dialogueScreenDecline.setInteractive();
		dialogueScreenOk.setInteractive();

		// Set Globals
		config._globals.set("dialogueScreenText", dialogueScreenText);
		config._globals.set("dialogueScreenAccept", dialogueScreenAccept);
		config._globals.set("dialogueScreenDecline", dialogueScreenDecline);
		config._globals.set("dialogueScreenOk", dialogueScreenOk);
		config._globals.set("menu", menu);
		config._globals.set("npcName", npcName);

		// Action
		// OK Button
		dialogueScreenOk.on('pointerdown', function ()
		{
			closeAllWindows();
		}, this);

		// Accept Button
		dialogueScreenAccept.on('pointerdown', function ()
		{
			parentL.socket.emit('getMission', { spriteid: id });
			closeAllWindows();
		}, this);

		// Close Button
		dialogueScreenDecline.on('pointerdown', function ()
		{
			closeAllWindows();
		}, this);
	}
}

// openMissionWindow: parentL - parent
function openMissionWindow(parentL)
{
	if(windowOpen == "")
	{
		// What we will display in mission area
		var text = "";

		// Mission Stuff
		if(parentL.player.missionId == 1)
		{
			text = "The soldier needs you to kill 1 zombie.\nYou have killed " + (parentL.player.missionStatus - 1) + " zombies.\n\nReward: $500\nXP: 1000";
		}

		// Prevent empty text
		if(text == "")
		{
			text = "You currently do not have an active mission.";
		}

		// Window Stuff
		windowOpen = "missionWindow";
		var exitButton = parentL.add.text(400, 50, "[Close]", { fontFamily: '"Times New Roman"', color: "red" }).setDepth(9999).setScrollFactor(0);
		var missionScreenText = parentL.add.text(400, 100, text, { fontFamily: '"Times New Roman"', color: "orange" }).setDepth(9999).setScrollFactor(0);

		// Set Interactive
		exitButton.setInteractive();

		// Set Globals
		config._globals.set("exitButton", exitButton);
		config._globals.set("missionScreenText", missionScreenText);

		// Action
		// Close Button
		exitButton.on('pointerdown', function ()
		{
			closeAllWindows();
		}, this);
	}
}

// openConstructionWindow: parentL - parent
function openConstructionWindow(parentL)
{
	if(windowOpen == "")
	{
		// Set construction menu
		var constructionMenu = 0;

		// Image
		var menu = parentL.add.image(400, 0, 'menu').setDepth(9999).setScrollFactor(0).setOrigin(0);

		// Window Stuff
		windowOpen = "constructionWindow";

		var constructionText1 = parentL.add.text(560, 70, "Beds", { fontFamily: '"Times New Roman"', color: "black", fontSize: "48px" }).setDepth(9999).setScrollFactor(0);
		var constructionText2 = parentL.add.text(560, 160, "Chairs", { fontFamily: '"Times New Roman"', color: "black", fontSize: "48px" }).setDepth(9999).setScrollFactor(0);
		var constructionText3 = parentL.add.text(540, 260, "Couches", { fontFamily: '"Times New Roman"', color: "black", fontSize: "48px" }).setDepth(9999).setScrollFactor(0);
		var constructionText4 = parentL.add.text(520, 350, "Electronics", { fontFamily: '"Times New Roman"', color: "black", fontSize: "48px" }).setDepth(9999).setScrollFactor(0);
		var constructionText5 = parentL.add.text(560, 447, "Plants", { fontFamily: '"Times New Roman"', color: "black", fontSize: "48px" }).setDepth(9999).setScrollFactor(0);
		var constructionText6 = parentL.add.text(550, 545, "Recliners", { fontFamily: '"Times New Roman"', color: "black", fontSize: "48px" }).setDepth(9999).setScrollFactor(0);
		var constructionText7 = parentL.add.text(560, 641, "Tables", { fontFamily: '"Times New Roman"', color: "black", fontSize: "48px" }).setDepth(9999).setScrollFactor(0);
		var exitButton = parentL.add.text(560, 735, "Close", { fontFamily: '"Times New Roman"', color: "black", fontSize: "48px" }).setDepth(9999).setScrollFactor(0);

		// Set Interactive
		exitButton.setInteractive();
		constructionText1.setInteractive();
		constructionText2.setInteractive();
		constructionText3.setInteractive();
		constructionText4.setInteractive();
		constructionText5.setInteractive();
		constructionText6.setInteractive();
		constructionText7.setInteractive();

		// Set Globals
		config._globals.set("menu", menu);
		config._globals.set("exitButton", exitButton);
		config._globals.set("constructionText1", constructionText1);
		config._globals.set("constructionText2", constructionText2);
		config._globals.set("constructionText3", constructionText3);
		config._globals.set("constructionText4", constructionText4);
		config._globals.set("constructionText5", constructionText5);
		config._globals.set("constructionText6", constructionText6);
		config._globals.set("constructionText7", constructionText7);

		// Action
		// Close Button
		exitButton.on('pointerdown', function ()
		{
			closeAllWindows();
		}, this);

		constructionText1.on('pointerdown', function ()
		{
			//constructionItem = 1;
			closeAllWindows();

			// Open Construction window
			windowOpen = "constructionMenu_bed";
			var constructionMenu = parentL.add.image(100, 100, 'constructionMenu_bed').setDepth(9999).setScrollFactor(0).setOrigin(0);

			// Set Interactive
			constructionMenu.setInteractive();

			// Set Global
			config._globals.set("constructionMenu", constructionMenu);

			// Close Button
			constructionMenu.on('pointerdown', function (pointer)
			{
				if(pointer.x >= 905 && pointer.x <= 946 && pointer.y >= 111 && pointer.y <= 154)
				{
					closeAllWindows();
				}
			}, this);
		}, this);

		constructionText2.on('pointerdown', function ()
		{
			//constructionItem = 1;
			closeAllWindows();

			// Open Construction window
			windowOpen = "constructionMenu_chair";
			var constructionMenu = parentL.add.image(100, 100, 'constructionMenu_chair').setDepth(9999).setScrollFactor(0).setOrigin(0);

			// Set Interactive
			constructionMenu.setInteractive();

			// Set Global
			config._globals.set("constructionMenu", constructionMenu);

			// Close Button
			constructionMenu.on('pointerdown', function (pointer)
			{
				if(pointer.x >= 905 && pointer.x <= 946 && pointer.y >= 111 && pointer.y <= 154)
				{
					closeAllWindows();
				}
			}, this);
		}, this);

		constructionText3.on('pointerdown', function ()
		{
			//constructionItem = 1;
			closeAllWindows();

			// Open Construction window
			windowOpen = "constructionMenu_couch";
			var constructionMenu = parentL.add.image(100, 100, 'constructionMenu_couch').setDepth(9999).setScrollFactor(0).setOrigin(0);

			// Set Interactive
			constructionMenu.setInteractive();

			// Set Global
			config._globals.set("constructionMenu", constructionMenu);

			// Close Button
			constructionMenu.on('pointerdown', function (pointer)
			{
				if(pointer.x >= 905 && pointer.x <= 946 && pointer.y >= 111 && pointer.y <= 154)
				{
					closeAllWindows();
				}
			}, this);
		}, this);

		constructionText4.on('pointerdown', function ()
		{
			//constructionItem = 1;
			closeAllWindows();

			// Open Construction window
			windowOpen = "constructionMenu_electronics";
			var constructionMenu = parentL.add.image(100, 100, 'constructionMenu_electronics').setDepth(9999).setScrollFactor(0).setOrigin(0);

			// Set Interactive
			constructionMenu.setInteractive();

			// Set Global
			config._globals.set("constructionMenu", constructionMenu);

			// Close Button
			constructionMenu.on('pointerdown', function (pointer)
			{
				if(pointer.x >= 905 && pointer.x <= 946 && pointer.y >= 111 && pointer.y <= 154)
				{
					closeAllWindows();
				}
			}, this);
		}, this);

		constructionText5.on('pointerdown', function ()
		{
			//constructionItem = 1;
			closeAllWindows();

			// Open Construction window
			windowOpen = "constructionMenu_plants";
			var constructionMenu = parentL.add.image(100, 100, 'constructionMenu_plants').setDepth(9999).setScrollFactor(0).setOrigin(0);

			// Set Interactive
			constructionMenu.setInteractive();

			// Set Global
			config._globals.set("constructionMenu", constructionMenu);

			// Close Button
			constructionMenu.on('pointerdown', function (pointer)
			{
				if(pointer.x >= 905 && pointer.x <= 946 && pointer.y >= 111 && pointer.y <= 154)
				{
					closeAllWindows();
				}
			}, this);
		}, this);

		constructionText6.on('pointerdown', function ()
		{
			//constructionItem = 1;
			closeAllWindows();

			// Open Construction window
			windowOpen = "constructionMenu_recliner";
			var constructionMenu = parentL.add.image(100, 100, 'constructionMenu_recliner').setDepth(9999).setScrollFactor(0).setOrigin(0);

			// Set Interactive
			constructionMenu.setInteractive();

			// Set Global
			config._globals.set("constructionMenu", constructionMenu);

			// Close Button
			constructionMenu.on('pointerdown', function (pointer)
			{
				if(pointer.x >= 905 && pointer.x <= 946 && pointer.y >= 111 && pointer.y <= 154)
				{
					closeAllWindows();
				}
			}, this);
		}, this);

		constructionText7.on('pointerdown', function ()
		{
			//constructionItem = 1;
			closeAllWindows();

			// Open Construction window
			windowOpen = "constructionMenu_tables";
			var constructionMenu = parentL.add.image(100, 100, 'constructionMenu_tables').setDepth(9999).setScrollFactor(0).setOrigin(0);

			// Set Interactive
			constructionMenu.setInteractive();

			// Set Global
			config._globals.set("constructionMenu", constructionMenu);

			// Close Button
			constructionMenu.on('pointerdown', function (pointer)
			{
				console.log(pointer.x);
				if(pointer.x >= 905 && pointer.x <= 946 && pointer.y >= 111 && pointer.y <= 154)
				{
					closeAllWindows();
				}
			}, this);
		}, this);
	}
}

// shootBullet: Shoot bullets
function shootBullet(id, x, y, rotation, parentL)
{
	// Code to shoot in the direction the player is aiming at
	//var bulletX = (x) + ((32 / 2) * Math.PI) * Math.cos(rotation);
	//var bulletY = (y) + ((32 / 2) * Math.PI) * Math.sin(rotation);
	// Spawn bullet
	/*var sprite = parentL.add.sprite(bulletX, bulletY, 'bullet').setOrigin(0, 0);
	sprite.playerID = id;
	sprite.created = new Date().getTime() + 10000;
	bullet_array.push(sprite);*/
	// Assign the bullet an id for the client to recognize
	//sprite.bulletID = bullet_array.length - 1;
	//sprite.bulletAngle = parentL.player.angle;
	// Tell the server
	parentL.socket.emit('bullet', { id: parentL.socket.id, spriteid: (bullet_array.length - 1), x: x, y: y, angle: (rotation + 91) });
	//parentL.socket.emit('bullet', { id: parentL.socket.id, spriteid: sprite.bulletID, x: sprite.x, y: sprite.y, angle: rotation });
	//return sprite;
}

// Zombie attack
function attackAnimation(sprite)
{
	if(!sprite.isAttacking)
	{
		sprite.anims.play("zAttack");
		sprite.isAttacking = true;
	}
}

// When a player animation is completed
function playerAnimComplete(anim1, anim2, sprite)
{
	// If shooting and moving...
	if(sprite.isShooting && sprite.isMoving)
	{
		sprite.anims.play("maleWalk");
	}

	sprite.isShooting = false;
}

// When an NPC animation is completed
function npcAnimComplete(anim1, anim2, sprite)
{
	// If is shooting
	if(sprite.isShooting2)
	{
		sprite.anims.play("maleWalk");
	}

	sprite.isShooting2 = false;
}

function otherPlayerAnimComplete(anim1, anim2, sprite)
{
	sprite.isShootingGoing = false;
}

// Zombie animation complete
function zombieAnimComplete(sprite)
{
	sprite.isAttacking = false;
	sprite.isShooting = false;
}

// Add commas
function numberWithCommas(x)
{
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var config = {
	type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 1238,
		height: 912
	},
	pixelArt: true,
	parent: 'dead-haven',
	physics: {
		default: 'arcade',
		arcade: {
			debug: false,
			gravity: { y: 0 }
		}
	},
	dom: {
		createContainer: true
	},
	scene: [mainMenu, mainGame]
};

config._globals = new Map();
 
var game = new Phaser.Game(config);