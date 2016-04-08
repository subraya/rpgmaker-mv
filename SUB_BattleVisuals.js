 /*:
 * @plugindesc Change several actor-related visual aspects on the battle screen
 * @author subraya
 * @version 1.0

 *
 * @param Vertical Status
 * @desc Actor status is show in one column and multiple rows
 * false - OFF     true - ON
 * @default true

 * @param Mark Current Input
 * @desc Mark the actor that is currently inputting.
 * false - OFF     true - ON
 * @default true
 *

 * @param Show Status Command
 * @desc Add a 'status' command to the actor's command window.
 * false - OFF     true - ON
 * @default true
 *

 * @param Name Status Command
 * @desc  'status' command name on the actor's command window.
 * @default Status
 *

 * @help
 * --------------------------------------------------------
 * --------------------------------------------------------
 * INTRODUCTION
 * --------------------------------------------------------
 * --------------------------------------------------------
 *
 * This plugin allows you to change some visual aspects on battle screen.
 *
 * --------------------------------------------------------
 * --------------------------------------------------------
 * DEPENDENCIES
 * --------------------------------------------------------
 * --------------------------------------------------------
 *
 * This plugin has no dependencies on other plugins.
 *
 * --------------------------------------------------------
 * --------------------------------------------------------
 * PARAMETERS
 * --------------------------------------------------------
 * --------------------------------------------------------
 *
 * - Vertical Status
 *
 * Default representation of an actor's status is:
 *    Name      (states)       HP       MP    (TP)
 * When set to true, 'Vertical Status' will change it to
 *    Name
 *    HP
 *    MP
 *    (TP/states)
 * If you are using TP, TP wil be displayed by default and will be alternated with actors' states (if any).
 * If you are not using TP, only states will be displayed (if any).
 *
 *
 * - Mark Current Input
 *
 * This parameter will only affect side view battle system. On side view system, the actor that is currently inputting command
 * takes a step forward. When set to true, the 'Mark Current Input' parameter adds a whitening effect to the current actor.
 *
 *
 * - Show Status Command
 *
 * When set to true, a status options is added in the actor's command window just under item option.
 *
 *
 * - Name Status Command
 *
 * The name (text the user will see) of the status option in the actor's command window.
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
 * CONTACT
 * --------------------------------------------------------
 * --------------------------------------------------------
 *
 * If you find a bug, have a doubt or want to tell me something, send an email to: subraya2013@gmail.com 
 * (please use a meaningful subject so I don't think it's spam).
 */

 // User configurable parameters

var SubPluginParams = SubPluginParams || {};
SubPluginParams.battleVisuals = PluginManager.parameters('SUB_BattleVisuals');

var SubPluginMethods = SubPluginMethods || {};


// Battle Status
if(SubPluginParams.battleVisuals['Vertical Status'] == 'true'){
    Window_Base.prototype.drawActorIcons = function(actor, x, y, width, currentSegment) {
        width = width || 144;
        currentSegment = currentSegment || 0;
        var segmentSize =  this.drawableStates(width);
        var icons = actor.allIcons().slice(segmentSize * currentSegment, segmentSize * (currentSegment + 1));
        for (var i = 0; i < icons.length; i++) {
            this.drawIcon(icons[i], x + Window_Base._iconWidth * i, y + 2);
        }
    };

    SubPluginMethods.maxPartyStates = function(){
        var members = $gameParty.battleMembers();
        var max = 0;
        for(var index = 0; index < members.length; index++){
            max = (members[index]._states.length > max ? members[index]._states.length : max);
        }
        return max;
    };

    Window_Base.prototype.drawableStates = function(width){
        return Math.floor(120 / Window_Base._iconWidth);
    };

    Window_BattleStatus.prototype.initialize = function() {
        var width = this.windowWidth();
        var height = this.windowHeight();
        var x = Graphics.boxWidth - width;
        var y = Graphics.boxHeight - height;
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this.refresh();
        this.openness = 0;
        this.tpMode = 0;
        this.alternate();
    };

    Window_BattleStatus.prototype.alternate = function() {
        var obj = this;
        var numSegments = Math.ceil(SubPluginMethods.maxPartyStates()/this.drawableStates(this._width));
        obj.tpMode = (obj.tpMode + 1) % Math.max(1, 1 + numSegments);
        setTimeout(function(){
            obj.refresh();
            obj.alternate();
        }, 4000);
    };

    Window_BattleStatus.prototype.maxCols = function() {
    	return 5;
    };

    Window_BattleStatus.prototype.drawItem = function(index) {
        var actor = $gameParty.battleMembers()[index];
        this.drawBasicArea(this.basicAreaRect(index), actor, index);
        this.drawGaugeArea(this.gaugeAreaRect(index), actor, index);
        this.drawStatusArea(this.gaugeAreaRect(index), actor, index);
    };

    Window_BattleStatus.prototype.drawBasicArea = function(rect, actor, index) {
        this.drawActorName(actor, 120*index, 0, 120);
    };

    Window_BattleStatus.prototype.drawGaugeArea = function(rect, actor, index) {
        this.drawActorHp(actor, 120*index, 36, 108);
        this.drawActorMp(actor, 120*index, 72, 108);
    };

    Window_BattleStatus.prototype.drawStatusArea = function(rect, actor, index){
        if ($dataSystem.optDisplayTp) {
            if(this.tpMode){
                this.drawActorIcons(actor, 120*index, 108, 120, this.tpMode - 1);
            }
            else{
                this.drawActorTp(actor, 120*index, 108, 108);
            }
        } else {
            this.drawActorIcons(actor, 120*index, 108, 120);
        }
    };
}


// Current input actor
if(SubPluginParams.battleVisuals['Mark Current Input'] == 'true'){
    Scene_Battle.prototype.startActorCommandSelection = function() {
        this._statusWindow.select(BattleManager.actor().index());
        $gameParty.selectCurrent(BattleManager.actor());
        this._partyCommandWindow.close();
        this._actorCommandWindow.setup(BattleManager.actor());
    };

    Scene_Battle.prototype.endCommandSelection = function() {
        this._partyCommandWindow.close();
        this._actorCommandWindow.close();
        this._statusWindow.deselect();
    };

    Game_Unit.prototype.selectCurrent = function(activeMember) {
        this.members().forEach(function(member) {
            if (member === activeMember) {
                member.selectCurrent();
            }
        });
    };

    Game_Unit.prototype.deselectCurrent = function(activeMember) {
        this.members().forEach(function(member) {
            if (member === activeMember) {
                member.deselectCurrent();
            }
        });
    };

    Game_Battler.prototype.selectCurrent = function() {
        this._selectedCurrent = true;
    };

    Game_Battler.prototype.deselectCurrent = function() {
        this._selectedCurrent = false;
    };

    Game_Battler.prototype.isSelectedCurrent = function() {
        return this._selectedCurrent;
    }


    Sprite_Battler.prototype.updateSelectionEffect = function() {
        var target = this._effectTarget;
        if (this._battler.isSelected() ) {
            this._selectionEffectCount++;
            if (this._selectionEffectCount % 30 < 15) {
                target.setBlendColor([255, 255, 255, 64]);
            } else {
                target.setBlendColor([0, 0, 0, 0]);
            }
        } 

        else if (this._selectionEffectCount > 0) {
            this._selectionEffectCount = 0;
            target.setBlendColor([0, 0, 0, 0]);
        }

        else if ( this._battler.isSelectedCurrent() ) {
            target.setBlendColor([255, 255, 255, 64]);
        }

        else{
             target.setBlendColor([0, 0, 0, 0]);
        }  
    };

    Scene_Battle.prototype.selectNextCommand = function() {
        $gameParty.deselectCurrent(BattleManager.actor());
        BattleManager.selectNextCommand();
        this.changeInputWindow();
    };

    Scene_Battle.prototype.selectPreviousCommand = function() {
        $gameParty.deselectCurrent(BattleManager.actor());
        BattleManager.selectPreviousCommand();
        this.changeInputWindow();
    };
}

// Status Command
if(SubPluginParams.battleVisuals['Show Status Command'] == 'true'){
    TextManager.actorStatus = SubPluginParams.battleVisuals['Name Status Command'];
    Scene_Battle.prototype.createAllWindows = function() {
        this.createLogWindow();
        this.createStatusWindow();
        this.createPartyCommandWindow();
        this.createActorCommandWindow();
        this.createHelpWindow();
        this.createSkillWindow();
        this.createItemWindow();
        this.createActorStatusWindow(); //added
        this.createActorWindow();
        this.createEnemyWindow();
        this.createMessageWindow();
        this.createScrollTextWindow();
    };

    Scene_Battle.prototype.createActorCommandWindow = function() {
        this._actorCommandWindow = new Window_ActorCommand();
        this._actorCommandWindow.setHandler('attack', this.commandAttack.bind(this));
        this._actorCommandWindow.setHandler('skill',  this.commandSkill.bind(this));
        this._actorCommandWindow.setHandler('guard',  this.commandGuard.bind(this));
        this._actorCommandWindow.setHandler('item',   this.commandItem.bind(this));
        this._actorCommandWindow.setHandler('actorstatus', this.commandActorStatus.bind(this)); // added
        this._actorCommandWindow.setHandler('cancel', this.selectPreviousCommand.bind(this));
        this.addWindow(this._actorCommandWindow);
    };

    Scene_Battle.prototype.commandActorStatus = function() {
        var actor = BattleManager.actor();
        this._actorStatusWindow.setActor(actor);
        this._actorStatusWindow.refresh();
        var obj = this;
        setTimeout(function(){
            obj._actorStatusWindow.show();
            obj._actorStatusWindow.refresh();
        }, 100);
        this._actorStatusWindow.activate();
    };

    Scene_Battle.prototype.isAnyInputWindowActive = function() {
        return (this._partyCommandWindow.active ||
                this._actorCommandWindow.active ||
                this._skillWindow.active ||
                this._itemWindow.active ||
                this._actorWindow.active ||
                this._actorStatusWindow.active ||
                this._enemyWindow.active);
    };

    Scene_Battle.prototype.createActorStatusWindow = function() {
        this._actorStatusWindow = new Window_Status();
        this._actorStatusWindow.setHandler('cancel', this.onActorStatusCancel.bind(this));
        this._actorStatusWindow.hide();
        this._actorStatusWindow.deactivate();
        this.addWindow(this._actorStatusWindow);
    };

    Scene_Battle.prototype.onActorStatusCancel = function() {
        this._actorStatusWindow.hide();
        this._actorCommandWindow.activate();
    };

    Window_ActorCommand.prototype.addActorStatusCommand = function() {
        this.addCommand(TextManager.actorStatus, 'actorstatus');
    };

    Window_ActorCommand.prototype.numVisibleRows = function() {
        return 4;
    };

    Window_ActorCommand.prototype.makeCommandList = function() {
        if (this._actor) {
            this.addAttackCommand();
            this.addSkillCommands();
            this.addGuardCommand();
            this.addItemCommand();
            this.addActorStatusCommand();
        }
    };

    function Window_BattleActorStatus() {
        this.initialize.apply(this, arguments);
    }
}