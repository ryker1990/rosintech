/*! rosin-device-backend 2018-11-26 */

"use strict";var s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var s=arguments[t];for(var r in s)Object.prototype.hasOwnProperty.call(s,r)&&(e[r]=s[r])}return e},t=function(){function r(e,t){for(var s=0;s<t.length;s++){var r=t[s];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,t,s){return t&&r(e.prototype,t),s&&r(e,s),e}}(),e=require("aws-sdk"),o=F(e),r=require("./ButtonsController"),n=F(r),a=require("./Config"),l=F(a),i=require("./Constants"),c=F(i),u=require("./Database"),p=F(u),h=require("nodemailer"),d=F(h),f=require("./RelayController"),S=F(f),m=require("./Server"),v=F(m),g=require("./TemperatureController"),P=F(g),T=require("wifi-control"),E=F(T),b=require("xlsx"),C=F(b),y=require("qr-image"),_=F(y),w=require("fs"),B=F(w),D=require("object-hash"),I=F(D),N=require("child_process"),x=F(N);function F(e){return e&&e.__esModule?e:{default:e}}function R(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var A=function(){function e(){R(this,e),this.relayController=new S.default,this.temperatureController=new P.default(this.relayController),this.server=new v.default,this.database=new p.default,this.buttonsController=new n.default(this),this.server.database=this.database,this.state={},this.updateTemperatures=this.updateTemperatures.bind(this),this.startPress=this.startPress.bind(this),this.cancelPress=this.cancelPress.bind(this),this.setCPUGovernor=this.setCPUGovernor.bind(this),this.onStartButton=this.onStartButton.bind(this),this.onCancelButton=this.onCancelButton.bind(this)}return t(e,[{key:"start",value:function(){var i=this;E.default.init({}),this.server.on(c.default.F_SAVE_PRESET,function(e,t,s,r,n,a,o){i.database.savePreset(e,t,s,r,n,a,o).then(i.database.loadPresets).then(function(e){i.state.presets=e,i.server.dispatch("updatePresets",i.state.presets)})}),this.server.on(c.default.F_DELETE_PRESET,function(e){i.database.deletePreset(e).then(i.database.loadPresets).then(function(e){i.state.presets=e,i.server.dispatch("updatePresets",i.state.presets)})}),this.server.on(c.default.F_SAVE_CURRENT_SESSION,function(e){i.database.saveCurrentSession(e).then(function(){return i.database.selectPreset(null)}).then(i.database.loadPresets).then(function(e){i.state.presets=e,i.server.dispatch("updatePresets",i.state.presets)}).then(i.database.loadCurrentSession).then(function(e){i.state.currentSession=s({},i.state.currentSession,e.state),i.server.dispatch("updateSession",i.state.currentSession)})}),this.server.on(c.default.F_SELECT_PRESET,function(e){i.database.selectPreset(e).then(i.database.loadPresets).then(function(e){i.state.presets=e,i.server.dispatch("updatePresets",i.state.presets);var t=e.find(function(e){return e.selected});null!=t&&(i.state.currentSession=s({},i.state.currentSession,{time:t.time,setTopTemp:t.topTemp,setBottomTemp:t.bottomTemp,bag:t.bag,bagSize:t.bag.size,material:t.material,strainName:t.strainName,weight:t.weight}),i.server.dispatch("updateSession",i.state.currentSession))})}),this.server.on(c.default.F_CANCEL_PRESS,this.cancelPress),this.server.on(c.default.F_SAVE_YIELD,function(e,t){i.database.saveYield(e,t).then(function(){i.state.press.phase=c.default.PHASE_IDLE,i.server.dispatch("updatePress",i.state.press)})}),this.server.on(c.default.F_SET_TOP_TEMP,function(t){-1!=i.state.presets.findIndex(function(e){return e.selected})?i.database.selectPreset(null).then(i.database.loadPresets).then(function(e){i.state.currentSession=s({},i.state.currentSession,{setTopTemp:t}),i.server.dispatch("updateSession",i.state.currentSession),i.temperatureController.setTopTargetTemp(t),i.state.presets=e,i.server.dispatch("updatePresets",i.state.presets)}):(i.state.currentSession=s({},i.state.currentSession,{setTopTemp:t}),i.server.dispatch("updateSession",i.state.currentSession),i.temperatureController.setTopTargetTemp(t))}),this.server.on(c.default.F_SET_BOTTOM_TEMP,function(t){-1!=i.state.presets.findIndex(function(e){return e.selected})?i.database.selectPreset(null).then(i.database.loadPresets).then(function(e){i.state.currentSession=s({},i.state.currentSession,{setBottomTemp:t}),i.server.dispatch("updateSession",i.state.currentSession),i.temperatureController.setBottomTargetTemp(t),i.state.presets=e,i.server.dispatch("updatePresets",i.state.presets)}):(i.state.currentSession=s({},i.state.currentSession,{setBottomTemp:t}),i.server.dispatch("updateSession",i.state.currentSession),i.temperatureController.setBottomTargetTemp(t))}),this.server.on(c.default.F_SET_TIME,function(t){-1!=i.state.presets.findIndex(function(e){return e.selected})?i.database.selectPreset(null).then(i.database.loadPresets).then(function(e){i.state.currentSession=s({},i.state.currentSession,{time:t}),i.server.dispatch("updateSession",i.state.currentSession),i.state.presets=e,i.server.dispatch("updatePresets",i.state.presets)}):(i.state.currentSession=s({},i.state.currentSession,{time:t}),i.server.dispatch("updateSession",i.state.currentSession))}),this.server.on(c.default.F_CONFIRM_CANCEL,function(){i.state.press.phase=c.default.PHASE_IDLE,i.server.dispatch("updatePress",i.state.press)}),this.server.on(c.default.CLIENT_CONNECTED,function(e){i.database.loadDeviceUiSettings().then(function(e){i.state.deviceUiSettings=e}).then(function(){i.server.updateClient(e,{session:i.state.currentSession,presets:i.state.presets,press:i.state.press,machineID:i.state.machineID,config:l.default,wifiSetup:i.state.wifiSetup,deviceUiSettings:i.state.deviceUiSettings,isEmergencyButtonEngaged:i.buttonsController.isEmergencyButtonDepressed})})}),this.server.on(c.default.F_GET_PRESSES,function(){i.database.loadPresses().then(function(e){i.state.presses=e,i.server.dispatch("updatePresses",i.state.presses)})}),this.server.on(c.default.F_EXPORT_HISTORY,function(a){i.database.loadPresses().then(function(e){var t,s=void 0;s={SheetNames:[],Sheets:{}},e=e.reverse().map(function(e){var t=void 0;return t={},null==e.date||null==e.date?t.Date=null:t.Date=new Date(e.date),t.Duration=i.timeFormatter(e.time),l.default.usesFahrenheit?(t["Bottom Temperature"]=i.toFahrenheit(e.bottomTemp)+" °F",t["Top Temperature"]=i.toFahrenheit(e.topTemp)+" °F"):(t["Bottom Temperature"]=e.bottomTemp+" °C",t["Top Temperature"]=e.topTemp+" °C"),null==e.weight||null==e.weight?t.Weight="Unknown":t.Weight=e.weight+" g",null==e.material||null==e.material?t.Material="Unknown":t.Material=e.material.name,null==e.bag||null==e.bag?(t.Bag="Custom",t["Bag Size"]=e.bagSize):(t.Bag=e.bag.name,t["Bag Size"]=e.bag.size),null==e.strainName||null==e.strainName?t["Strain name"]="Unknown":t["Strain name"]=e.strainName,null==e.yield||null==e.yield||-1==e.yield?t.Yield="Unknown":t.Yield=e.yield+" g",t}),t=C.default.utils.json_to_sheet(e),s.SheetNames.push("History"),s.Sheets.History=t,C.default.writeFile(s,"history.xlsx");var r=d.default.createTransport({SES:new o.default.SES(l.default.AWS)}),n={from:'"ROSIN TECH" <support@rosintechproducts.com>',to:a,subject:"Your press history",text:l.default.emailText,html:l.default.emailHTML,attachments:[{filename:"history.xlsx",path:"history.xlsx"}]};r.sendMail(n,function(e,t){if(e)return i.state.export={error:e},i.server.dispatch("updateExport",i.state.export),void console.log("Message not sent: %s",e);i.state.export={info:t},i.server.dispatch("updateExport",i.state.export),console.log("Message %s sent: %s",t.messageId,t.response)})})}),this.server.on(c.default.F_CLEAR_EXPORT,function(){i.state.export={},i.server.dispatch("updateExport",i.state.export)});var u=this;return this.setCPUGovernor().then(function(){return console.log("√ CPU governor set.")}).catch(function(e){console.log("Couldn't set CPU governor, this will probably result in bad temperature readings.",e)}).then(this.relayController.start).then(function(e){i.state.relays=e}).then(function(){return console.log("√ Relay controller started.")}).then(function(){return new Promise(function(a,o){x.default.exec("ifconfig | grep ether",{},function(e,t,s){var r=(0,I.default)(t);u.state.machineID=r,console.log("√ Unique machine ID (received/set): "+r+" / "+u.state.machineID);var n=_.default.imageSync(r,{type:"svg",size:4});B.default.writeFile("../frontend/img/qr.svg",n,function(e){e?(console.log("Error writing QR code: "),console.log(e),o()):(console.log("√ QR code written"),a())})})})}).then(this.temperatureController.start).then(function(){return console.log("√ Temperature controller started.")}).then(function(){return i.database.start(u.state.machineID)}).then(function(){return console.log("√ Database controller started.")}).then(this.database.loadDeviceUiSettings).then(function(e){i.state.deviceUiSettings=e}).then(this.database.loadWifiSetup).then(function(e){i.state.wifiSetup=e}).then(this.database.setWifiSetup).then(this.database.loadCurrentSession).then(function(e){i.state.currentSession=e.state,i.server.dispatch("updateSession",i.state.currentSession)}).then(this.database.loadPresets).then(function(e){i.state.presets=e,i.server.dispatch("updatePresets",i.state.presets);var t=e.find(function(e){return e.selected});null!=t&&(i.temperatureController.setTopTargetTemp(t.topTemp),i.temperatureController.setBottomTargetTemp(t.bottomTemp))}).then(this.server.start).then(function(){return console.log("√ Server controller started.")}).then(function(){console.log("Will call sync."),i.database.sync(),setInterval(function(){i.updateTemperatures()},1e3)}).then(function(){})}},{key:"onStartButton",value:function(){console.log("onStartButton called"),this.buttonsController.isStartButtonDepressed?console.log("Start button's last state is unpressed. Not starting."):this.buttonsController.isEmergencyButtonDepressed?console.log("Emergency button's last state is depressed. Not starting."):(this.state&&this.state.press&&this.state.press.phase&&console.log("[STORED PHASE] "+this.state.press.phase),null!=this.state&&null!=this.state.currentSession&&null!=this.state.currentSession.setTopTemp&&null!=this.state.currentSession.setBottomTemp&&null!=this.state.currentSession.time?(console.log("state:"),console.log(this.state),null==this.state.press||this.state.press.phase==c.default.PHASE_IDLE?this.startPress(this.state.currentSession.setTopTemp,this.state.currentSession.setBottomTemp,this.state.currentSession.time).catch(function(e){console.log("Error starting press"),console.log(e)}):console.log("Press in progress, won't start.")):console.log("Client side is probably not connected."))}},{key:"onCancelButton",value:function(){console.log("onCancelButton called"),null==this.state.press||!0!==this.buttonsController.isEmergencyButtonDepressed||this.state.press.phase!=c.default.PHASE_CLOSING&&this.state.press.phase!=c.default.PHASE_PRESSING?console.log("[PRESS] Skipping cancel, button is not pressed."):(console.log("[PRESS] Canceling press."),this.cancelPress()),this.server.dispatch("updateEmergencyButtonState",this.buttonsController.isEmergencyButtonDepressed)}},{key:"cancelPress",value:function(){var e=this;null==this.state.press&&(this.state.press={}),console.log("cancelPress called"),this.state.press.phase=c.default.PHASE_CANCELLING,this.server.dispatch("updatePress",this.state.press),this.relayController.openPress().then(function(){e.state.press.phase=c.default.PHASE_IDLE,e.server.dispatch("updatePress",e.state.press)})}},{key:"startPress",value:function(e,t,s){var r=this;return null==this.state.press&&(this.state.press={}),this.state.press.phase=c.default.PHASE_CLOSING,this.state.press.time=s,this.state.press.endTime=(new Date).getTime()+1e3*s+l.default.travelTime[l.default.pressType],this.server.dispatch("updatePress",this.state.press),this.relayController.closePress().then(function(){return r.state.press.phase=c.default.PHASE_PRESSING,r.server.dispatch("updatePress",r.state.press),r.relayController.startPress(1e3*s)}).then(function(){r.state.press.phase=c.default.PHASE_OPENING,r.server.dispatch("updatePress",r.state.press)}).then(this.relayController.openPress).then(function(){return r.database.savePress(e,t,s,r.state.currentSession)}).then(function(e){r.state.press.phase=c.default.PHASE_YIELD,r.state.press.pressID=e._id,r.server.dispatch("updatePress",r.state.press)}).catch(function(e){console.log("Error starting - will try to reset press"),r.state.press.phase=c.default.PHASE_IDLE,r.server.dispatch("updatePress",r.state.press),r.relayController.openPress()})}},{key:"setCPUGovernor",value:function(){return new Promise(function(r,n){x.default.exec('echo "performance" | tee /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor',{},function(e,t,s){e?n(e):r()})})}},{key:"updateTemperatures",value:function(){this.state.currentSession=s({},this.state.currentSession,{topTemp:this.temperatureController.topTemperature,bottomTemp:this.temperatureController.bottomTemperature}),this.server.dispatch("updateSession",this.state.currentSession)}},{key:"toFahrenheit",value:function(e){return 9*e/5+32}},{key:"timeFormatter",value:function(e){if(isNaN(e)||null==e)return"00:00";var t,s;return((t=Math.floor(e/60))<10?"0"+t:""+t)+":"+((s=Math.floor(e%60))<10?"0"+s:""+s)}}]),e}(),q=void 0;(q=new A).start().then(function(){console.log("√ Backend startup complete.")}).catch(function(e){console.error("Backend startup failed: "+e)});
//# sourceMappingURL=../sourcemap/index.js