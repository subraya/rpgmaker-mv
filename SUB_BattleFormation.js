 /*:
 * @plugindesc Add a fifth member for battles and change the party's battle formation both visually and stat-wise
 * @author subraya
 * @version 1.0.0
 *
 * @param ---Labels---
 * @default

 * @param Option Menu Name
 * @desc Text label for the main menu option.
 * @default Battle Formation
 
 * @param Line Formation Name
 * @desc Text label for line formation.
 * @default Line
 
 * @param X Formation Name
 * @desc Text label for X formation.
 * @default X-Formation
 
 * @param V Formation Name
 * @desc Text label for V formation.
 * @default V-Formation
 
 * @param ---Functionality---
 * @default

 * @param Hide When Disabled
 * @desc true - hide, false - disabled
 * @default true

 * @param Allow Param Changes
 * @desc true - allow, false - no
 * @default true

 * @help
 * --------------------------------------------------------
 * --------------------------------------------------------
 * INTRODUCTION
 * --------------------------------------------------------
 * --------------------------------------------------------
 *
 * This plugin has three main goals:
 * 1: allows you to fight with 5 members instead of 4
 *
 * 2: allows you to change the party's battle formation. In this pluguin, battle formations means how the party's sprites
 * are arrange in the battle screen.
 *
 * 3: battle formations will also affect in-battle stats. Actors in the front line will have increased atk, mat ang agi, but will
 * also have lower defenses. Actors in the back line will suffer the opposite effects
 *
 * --------------------------------------------------------
 * --------------------------------------------------------
 * DISCLAIMER
 * --------------------------------------------------------
 * --------------------------------------------------------
 *
 * I made this pluguin because my game needed 5-member battles. Instead of looking for someone else's plugin or waiting for someone
 * to do it, I just thought of it as a programming exercise to get into JavaScript and RPGMaker. So I don't know if there is another plugin like
 * it. If there is and it's better, go for it.

 * Adding a fifth member was quite easy. Once I did it, I remembered the SNES's game 'Sailor Moon Another Story' and took the battle
 * formations idea from it.
 *
 * --------------------------------------------------------
 * --------------------------------------------------------
 * DEPENDENCIES
 * --------------------------------------------------------
 * --------------------------------------------------------
 *
 * This plugin has no dependendies.
 *
 * --------------------------------------------------------
 * --------------------------------------------------------
 * PARAMETERS
 * --------------------------------------------------------
 * --------------------------------------------------------
 *
 * -- Option Menu Name: Text label for the main menu option.
 * -- Line Formation Name: Text label for the line battle formation.
 * -- X Formation Name: Text label for the X battle formation.
 * -- V Formation Name: Text label for the V battle formation.
 * -- Hide When Disabled: Main menu option is only availaible if your party has 5 members. When set to true, battle formation
 * option won't be shown on the main menu when unavailaible. If false, the option will be disabled but still visible.
 * -- Allow Param Changes: Allow actors base param changes according to formation. Set it to false if you just wanna use battle
 * formation for visual purposes
 *
 * --------------------------------------------------------
 * --------------------------------------------------------
 * ABOUT STATS' CHANGES
 * --------------------------------------------------------
 * --------------------------------------------------------
 *
 * When changing battle formation, actors' stats will also change during battle. Changes will be random and only affect
 * class's base params. Changes are calculated according the following criteria:
 * - Line formation: no changes
 * - X Formation: random values between 0 and 10%. No changes for Actor1. Actors 2 and 3 have increased atk, mat and agi,
 * but reduced def, mdf and luk. Viceversa for actors 4 and 5.
 * - V Formation: random values between 0 and 5%. No changes for Actors 2 and 3. Actor 1 has increased atk, mat and agi,
 * but reduced def, mdf and luk. Viceversa for actors 4 and 5.
 *
 * This is just the option i opted for. Feel free to change it to your own taste.
 *
 *
 * --------------------------------------------------------
 * --------------------------------------------------------
 * TERMS OF USE
 * --------------------------------------------------------
 * --------------------------------------------------------
 *
 * You must credit me if you are using this plugin
 * You can use this plugin for non-commercial projects.
 * You can use this plugin for commercial projects.
 *
 * --------------------------------------------------------
 * --------------------------------------------------------
 * FUTURE WORK
 * --------------------------------------------------------
 * --------------------------------------------------------
 *
 * - Add more parameters for easy customization on sprites' position and stats changes.
 * - Check how the plugin's behaviour when the party goes from 5 members to 4 or less (default to line?)
 * - Increase the maximum number of members and battle formation types
 *
 * --------------------------------------------------------
 * --------------------------------------------------------
 * CONTACT
 * --------------------------------------------------------
 * --------------------------------------------------------
 *
 * If you find a bug, have a doubt or want to tell me something, contact me on github:
 * https://github.com/subraya/rpgmaker-mv.
 */


var SubPluginParams = SubPluginParams || {};
SubPluginParams.battleFormation = PluginManager.parameters('SUB_BattleFormation');

TextManager.battleFormation = String(SubPluginParams.battleFormation['Option Menu Name']); //user param
TextManager.formationLine =  String(SubPluginParams.battleFormation['Line Formation Name']); //user param
TextManager.formationX = String(SubPluginParams.battleFormation['X Formation Name']); //user param
TextManager.formationV = String(SubPluginParams.battleFormation['V Formation Name']); //user param





Game_System.prototype.initialize = function() {
    this._saveEnabled = true;
    this._menuEnabled = true;
    this._encounterEnabled = true;
    this._formationEnabled = true;
    this._battleCount = 0;
    this._winCount = 0;
    this._escapeCount = 0;
    this._saveCount = 0;
    this._versionId = 0;
    this._framesOnSave = 0;
    this._bgmOnSave = null;
    this._bgsOnSave = null;
    this._windowTone = null;
    this._battleBgm = null;
    this._victoryMe = null;
    this._defeatMe = null;
    this._savedBgm = null;
    this._walkingBgm = null;
    this._battleFormation = 'formationLine'; //added //TODO: change it to a numeric codification
};

Game_Party.prototype.maxBattleMembers = function(){
    return 5;
};

//-----------------------------------------------------------------------------
// Game_Unit
//
// Modify party's actors params on battle start
//

Game_Unit.prototype.onBattleStart = function() {
    var members = this.members();
    for(var idx = 0; idx < members.length; idx++){
        members[idx].onBattleStart();
        //doing this on game_unit instead of game_actor might not be the best idea
        if(members[idx] instanceof Game_Actor) members[idx].setModifiers(idx);
    };
    this._inBattle = true;
};

//-----------------------------------------------------------------------------
// Game_Actor
//
// Recalculate base params according to battle formation
//

Game_Actor.prototype.setModifiers = function(index){
    var modifiers = [0, 0, 0, 0, 0, 0, 0, 0];
    if(SubPluginParams.battleFormation['Allow Param Changes'] == 'true'){
        var formation = $gameSystem._battleFormation;
        switch(formation){
            /*
            * if you want to change the calculations and need some ideas,
            * just go to the end of file
            */
            case 'formationV':
                if(index == 0){
                    modifiers[2] = modifiers[4] = modifiers[6] = Math.random()*0.05;
                    modifiers[3] = modifiers[5] = modifiers[7] = -Math.random()*0.05;
                }
                else if(index == 3 || index == 4){
                    modifiers[2] = modifiers[4] = modifiers[6] = -Math.random()*0.05;
                    modifiers[3] = modifiers[5] = modifiers[7] = Math.random()*0.05;
                }
                break;
            case 'formationX':
                if(index == 1 || index == 2){
                    modifiers[2] = modifiers[4] = modifiers[6] = Math.random()*0.05;
                    modifiers[3] = modifiers[5] = modifiers[7] = -Math.random()*0.05;
                }
                else if(index == 3 || index == 4){
                    modifiers[2] = modifiers[4] = modifiers[6] = -Math.random()*0.05;
                    modifiers[3] = modifiers[5] = modifiers[7] = Math.random()*0.05;
                }
                break;
        }
    }
    this._modifiers = modifiers;
};

Game_Actor.prototype.paramBase = function(paramId) {
    var modifier = ( $gameParty.inBattle() && this._modifiers ? this._modifiers[paramId] : 0); 
    return this.currentClass().params[paramId][this._level] * (1 + modifier);
};


//-----------------------------------------------------------------------------
// Scene_Menu
//
// We need to add the battle formation option to the main menu
//

Scene_Menu.prototype.createCommandWindow = function() {
    $dataSystem.terms.commands[26] = 'Batalla'; //added
    $dataSystem.menuCommands[6] = true; //user param //added
    this._commandWindow = new Window_MenuCommand(0, 0);
    this._commandWindow.setHandler('item',      this.commandItem.bind(this));
    this._commandWindow.setHandler('skill',     this.commandPersonal.bind(this));
    this._commandWindow.setHandler('equip',     this.commandPersonal.bind(this));
    this._commandWindow.setHandler('status',    this.commandPersonal.bind(this));
    this._commandWindow.setHandler('formation', this.commandFormation.bind(this));
    this._commandWindow.setHandler('battleFormation', this.commandBattleFormation.bind(this)); //added
    this._commandWindow.setHandler('options',   this.commandOptions.bind(this));
    this._commandWindow.setHandler('save',      this.commandSave.bind(this));
    this._commandWindow.setHandler('gameEnd',   this.commandGameEnd.bind(this));
    this._commandWindow.setHandler('cancel',    this.popScene.bind(this));
    this.addWindow(this._commandWindow);
};

Scene_Menu.prototype.commandBattleFormation = function() {
    SceneManager.push(Scene_BattleFormation);
};


//-----------------------------------------------------------------------------
// Scene_BattleFormation
//
// The scene class of the battle formation screen
//

function Scene_BattleFormation() {
    this.initialize.apply(this, arguments);
}

Scene_BattleFormation.prototype = Object.create(Scene_MenuBase.prototype);
Scene_BattleFormation.prototype.constructor = Scene_BattleFormation;

Scene_BattleFormation.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this._previousFormation = $gameSystem._battleFormation;
    this.createBattleFormationWindow();
};

Scene_BattleFormation.prototype.createBattleFormationWindow = function() {
    this._battleFormationWindow = new Window_BattleFormation(0,0,Graphics.boxWidth,Graphics.boxHeight/4);
    this._battleFormationWindow.setHandler('ok',     this.save.bind(this));
    this._battleFormationWindow.setHandler('cancel', this.cancel.bind(this));
    this.addWindow(this._battleFormationWindow);
    this._battleFormationWindow.select();
    var obj = this;
    //todo: review
    setTimeout(function(){
        obj._battleFormationWindow.refresh();
    }, 50);
};

Scene_BattleFormation.prototype.save = function() {
    $gameSystem._battleFormation = this._battleFormationWindow.getFormation();
    this.popScene();
};

Scene_BattleFormation.prototype.cancel = function() {
    $gameSystem._battleFormation = this._previousFormation;
    this.popScene();
};


//-----------------------------------------------------------------------------
// Window_BattleFormation
//
// The window for selecting the battle formation
//

function Window_BattleFormation() {
    this.initialize.apply(this, arguments);
}

Window_BattleFormation.prototype = Object.create(Window_Selectable.prototype);
Window_BattleFormation.prototype.constructor = Window_BattleFormation;

Window_BattleFormation.prototype.initialize = function(x, y, width, height) {
    var width = Graphics.boxWidth;
    var height = Graphics.boxHeight;
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.activate();
};

Window_BattleFormation.prototype.getFormation = function(){
    var index = this.findSelected();
    return (index > -1 ?
        this.getOptions()[index].key :
        '');
};

Window_BattleFormation.prototype.getOptions = function(){
    return [
        { id: 0, name: TextManager.formationLine, key: 'formationLine' },
        { id: 1, name: TextManager.formationX, key: 'formationX' },
        { id: 2, name: TextManager.formationV, key: 'formationV' }
    ];
}

Window_BattleFormation.prototype.findSelected = function(){
    var key = $gameSystem._battleFormation;
    var idx = 0, found = false;
    var options =  this.getOptions();
    while(idx < options.length && !found){
        found = (key == options[idx].key);
        idx++;
    }
    if (found) return idx-1;
    return -1;
};

Window_BattleFormation.prototype.select = function(index) {
    if(!(index >= 0)) index = this.findSelected();
    Window_Selectable.prototype.select.call(this, index);
    if(index >= 0){
        $gameSystem._battleFormation = this.getOptions()[index].key;
    }
    this.refresh();
};

Window_BattleFormation.prototype.maxCols = function(){
    return 3;
};

Window_BattleFormation.prototype.maxItems = function() {
    return 3;
};

Window_BattleFormation.prototype.itemHeight = function() {
    var innerHeight = this.height - this.padding * 2;
    return this.lineHeight();
};

Window_BattleFormation.prototype.drawItem = function(index) {
    var list = this.getOptions();
    var lineHeight = this.lineHeight();
    var rect = this.itemRectForText(index);
    this.drawText(list[index].name, rect.x, rect.y, this.contents.width/3, 'center');
};

Window_BattleFormation.prototype.drawBlock1 = function(y) {
    this.drawAllItems();
};

Window_BattleFormation.prototype.drawHorzLine = function(y) {
    var lineY = y + this.lineHeight() / 2 - 1;
    this.contents.paintOpacity = 48;
    this.contents.fillRect(0, lineY, this.contentsWidth(), 2, this.normalColor());
    this.contents.paintOpacity = 255;
};

Window_BattleFormation.prototype.drawBlock2 = function(y) {
    var members = $gameParty.battleMembers();
    var member, bitmap;
    var sw = 64, sh = 64, sx = 0, sy = 0;
    var dx, dy;

    for(var idx = 0; idx < members.length; idx++){
        member = members[idx];
        bitmap = ImageManager.loadSvActor(member._battlerName, 0);
        bitmap.width = 2 * (sw + sx);
        bitmap.height = 2 * (sh + sy);
        dx = 0 + (new Sprite_Actor()).calculateActorHomeX(idx) - Graphics.boxWidth/3;
        dy = y + (new Sprite_Actor()).calculateActorHomeY(idx) - Graphics.boxWidth/4;
        this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy);
    }
};

Window_BattleFormation.prototype.playOkSound = function() {
};

Window_BattleFormation.prototype.refresh = function() {
    this.contents.clear();
    var lineHeight = this.lineHeight();
    this.drawBlock1(lineHeight * 0);
    this.drawHorzLine(lineHeight * 1);
    this.drawBlock2(lineHeight * 2);
};


//-----------------------------------------------------------------------------
// Window_MenuCommand
//
// We need to modify the existing class to add the battle formation command
//

Window_MenuCommand.prototype.makeCommandList = function() {
    this.addMainCommands();
    this.addFormationCommand();
    this.addBattleFormationCommand(); //added
    this.addOriginalCommands();
    this.addOptionsCommand();
    this.addSaveCommand();
    this.addGameEndCommand();
};

Window_MenuCommand.prototype.needsCommand = function(name) {
    var flags = $dataSystem.menuCommands;
    if (flags) {
        switch (name) {
        case 'item':
            return flags[0];
        case 'skill':
            return flags[1];
        case 'equip':
            return flags[2];
        case 'status':
            return flags[3];
        case 'formation':
            return flags[4];
        case 'save':
            return flags[5];
        case 'battleFormation': //added
            return flags[6];
        }
    }
    return true;
};

Window_MenuCommand.prototype.addBattleFormationCommand = function() {
    if(this.needsCommand('battleFormation')){
        if ($gameParty._actors.length == 5) {
            this.addCommand(TextManager.battleFormation, 'battleFormation', true);
        }
        else if(SubPluginParams.battleFormation['Hide When Disabled'] == 'false'){
            this.addCommand(TextManager.battleFormation, 'battleFormation', false);
        }
    }
};


//-----------------------------------------------------------------------------
// Sprite_Actor
//
// We need to modify the existing class in order to set sprites' position
// according to the battle formation option
//

Sprite_Actor.prototype.calculateActorHomeOffsetX = function(index){
    var x = 0;
    var formation = $gameSystem._battleFormation;
    switch(formation){
        case 'formationV':
            x += -16*(index==1 || index==2 ? 1 : 0);
            x += -32*(index==0 ? 1 : 0);
            break;
        case 'formationX':
            x += 32*(index==0 ? 1 : 0);
            x += -96*(index==1 ? 1 : 0);
            x += -112*(index==2 ? 1 : 0);
            break;
    }
    return x;
};

Sprite_Actor.prototype.calculateActorHomeOffsetY = function(index){
    var y = 0;
    var formation = $gameSystem._battleFormation;
    switch(formation){
        case 'formationV':
            y += 96*(index==0 ? 1 : 0);
            y += 48*(index==2 ? 1 : 0);
            y += -144*(index==3 ? 1 : 0);
            break;
        case 'formationX':
            y += 96*(index==0 ? 1 : 0);
            y += -48*(index==1 ? 1 : 0);
            y += 96*(index==2 ? 1 : 0);
            y += -144*(index==3 ? 1 : 0);
            break;
    }
    return y;
};

Sprite_Actor.prototype.calculateActorHomeX = function(index, formation){
    var x = 600 + index * 32;
    x = x + this.calculateActorHomeOffsetX(index);
    return x;
};

Sprite_Actor.prototype.calculateActorHomeY = function(index, formation){
    var y = 280 + index * 48;
    y = y + this.calculateActorHomeOffsetY(index);
    return y;
};

Sprite_Actor.prototype.setActorHome = function(index) {
    var x = this.calculateActorHomeX(index);
    var y = this.calculateActorHomeY(index);
    this.setHome(x, y);
};


/*
MORE OPTIONS FOR THE STATS' MODIFIERS

(suffix _m stands for modifier)

1. Basic options

- independent values: 
    atk_m = x; def_m = y; ...
    quite simple, a different value for every stat

- high risk, high reward:
    atk_m = mat_m = ... ; def_m = mdf_m = ...
    if you get a favorable value on a stat, you'll also get it on the other related STATS
    and viceversa if get a bad value

- ultra high risk, ultra high reward:
    atk_m = mat_m = - def_m = -dfm_m = ...
    same as the previous one, but doubling the boxHeight

- auto coerced
    assume each modifiers is something between 0 and max_value
    you could try a system like atk_m + def_m + ... = max_value
    so if you get a high (either positive or negative), other values will remain low

- ...or just don't use random values


2. Try different approaches

as you have seen, I like to work with percent values between 0 and 5-10%, but that doesn't mean you
can't try other things

- what if you change the maximum to 50%? maybe kill or be killed in one hit?
- what if you add an offset so the minimum value will never be zero?
- what if you use a flat value instead of a percent?


3. Change the random distribution!

(you'll need to know some maths for this...)
typical random number generator methods (such like Math.random) give you a number between 0 and 1 with
a uniform distribution.

so why dont you try to change the distribution? 
Example: how to get a random number y betwwen 0 and 1 with a tringular distribution
    - get a typical random number x between 0 and 1 (x=random)
    - now do y = sqrt(x/2)
    - if y>0.5, then do y = 1 - sqrt(1-0.5*(x+1))
    - and that's all
*/
