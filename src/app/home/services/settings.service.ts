import { Injectable, Injector } from '@angular/core';

@Injectable()
export class SettingsService {
    
    public user = {
        name:       '',
        id:         '',
        state:      ''
    };

    constructor(
        private injector:       Injector,
    ) { }

}
