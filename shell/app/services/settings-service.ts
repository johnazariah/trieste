// import { Injectable } from "@angular/core";
// import * as storage from "electron-json-storage";
// import { BehaviorSubject, Observable } from "rxjs";

// import { Settings, defaultSettings } from "../../app/models/settings";

// @Injectable()
// export class SettingsService {
//     public settingsObs: Observable<Settings>;
//     public hasSettingsLoaded: Observable<boolean>;
//     public settings: Settings;

//     private _hasSettingsLoaded = new BehaviorSubject<boolean>(false);
//     private _settingsSubject = new BehaviorSubject<Settings>(null);
//     private _filename = "settings";

//     constructor() {
//         this.settingsObs = this._settingsSubject.asObservable();
//         this.hasSettingsLoaded = this._hasSettingsLoaded.asObservable();
//         this.loadSettings();
//     }

//     private loadSettings() {
//         storage.get(this._filename, (error, data) => {
//             this.settings = Object.assign({}, defaultSettings, data);
//             this._hasSettingsLoaded.next(true);
//             this._settingsSubject.next(this.settings);
//         });
//     }
// }
