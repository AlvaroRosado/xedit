import { isNil, isEmpty, hasIn } from 'ramda';
import { Configs } from './configs';

import sanitizeHtml from 'sanitize-html';

export class ClipboardConfigs extends Configs {
    protected static GROUP = 'clipboardConfigs';
    protected static DEFAULT: any = {
        active: false,
        configs: [
            {
                id: 'copy',
                name: 'Format copy',
                selected: 'copyPlain',
                options: {
                    copyHtml: 'Copy as HTML',
                    copyPlain: 'Copy as Plain Text'
                }
            }
        ]
    };

    private self: any = this.constructor;
    protected configs: any;

    constructor() {
        super();

        this.configs = {};
        this.init();
    }

    public setConfigs(configs: any) {
        this.configs.configs = configs;
        ClipboardConfigs.save(this.configs);
        return this;
    }

    public getConfigs(config: string = null): any {
        const configs = this.configs.configs;
        if (isNil(config)) {
            return configs;
        }

        for (let i = 0; i < configs.length; i++) {
            if (hasIn('id', configs[i])) {
                return configs[i];
            }
        }
    }

    public toggleActive(): boolean {
        this.configs.active = !this.configs.active;
        ClipboardConfigs.save(this.configs);
        return this.isActive();
    }

    public isActive(): boolean {
        const active = hasIn('active', this.configs) ? this.configs.active : null;
        return active;
    }

    public addConfig(config: any) {
        if (isNil(this.configs)) {
            this.configs = ClipboardConfigs.DEFAULT;
        }
        this.configs.configs.push(config);
        return this.setConfigs(this.configs);
    }

    public updateConfigs() {
        this.init();
    }

    private init() {
        this.self.get().then(data => {
            if (isNil(data)) {
                data = this.self.DEFAULT;
            }
            this.configs = data;
        });
    }

    public static save(data: any, group: string = ClipboardConfigs.GROUP): any {
        if (isEmpty(group)) {
            group = ClipboardConfigs.GROUP;
        }
        return super.save(data, group);
    }

    public static get(group: string = ClipboardConfigs.GROUP): any {
        if (isEmpty(group)) {
            group = ClipboardConfigs.GROUP;
        }
        return super.get(group);
    }

    protected static callback(error, value): any {
        if (error) {
            console.error(error);
        } else {
            if (isNil(value)) {
                value = ClipboardConfigs.DEFAULT;
            }
        }

        return value;
    }

    /**
     * This method get data in plain format from clipboard
     */
    public static copyPlain(evt: ClipboardEvent) {
        return evt.clipboardData.getData('text/plain');
    }

    /*
     * This method get the data in html format from the clipboard but if it is empty it try to get in plain format
     */
    public static copyHtml(evt: ClipboardEvent) {
        let data = evt.clipboardData.getData('text/plain');
        const html = evt.clipboardData.getData('text/html');
        if (html) {
            data = sanitizeHtml(html);
        }
        return data;
    }

    public static copy(evt: ClipboardEvent, asHtml = true) {
        let data = '';
        if (asHtml) {
            data = ClipboardConfigs.copyHtml(evt);
        } else {
            data = ClipboardConfigs.copyPlain(evt);
        }
        return data;
    }
}
