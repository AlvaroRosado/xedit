import { equals, isNil, contains, hasIn, is } from 'ramda';

import { XeditMapper } from '@models/schema/xedit-mapper';
import { Converters } from '@utils/converters';
import { Xedit } from '../xedit';
import { Api } from '../api';
import Router from '@app/core/mappers/router';

export class Node {
    static TYPE_IMAGE = 'image';
    static TYPE_VIDEO = 'video';
    static TYPE_OTHER = 'other';

    // Variables
    private areaId;
    private uuid: string;
    private target: HTMLElement;
    private schema: any;
    private schemaNode: any;
    private name: string;
    private section: any;
    private attributes: Object;
    private uuidSectionsPath: Array<string>;
    private sectionsPath: Array<string>;
    private module: any;

    // Constructor
    constructor(uuid: string, target: any, attributes: Object = {}) {
        if (isNil(uuid) || isNil(name)) {
            throw new TypeError('Invalid arguments');
        }

        this.uuid = uuid;
        this.name = target.tagName.toLowerCase();
        this.target = target;
        this.section = Node.getContainer(this.target);
        this.uuidSectionsPath = Node.getContextPath(
            this.target,
            XeditMapper.TAG_EDITOR,
            XeditMapper.TAG_UUID,
            XeditMapper.TAG_UUID,
            [],
            false,
            true
        );
        this.sectionsPath = Node.getContextPath(
            this.target,
            XeditMapper.TAG_EDITOR,
            XeditMapper.TAG_SECTION_TYPE,
            XeditMapper.TAG_SECTION_TYPE,
            [],
            true
        );
        this.areaId = this.uuidSectionsPath.shift();
        this.attributes = attributes;

        this.schemaNode = Xedit.getConf('schemas')[this.areaId];
        this.schema = this.schemaNode[this.getSection().getAttribute(XeditMapper.TAG_SECTION_TYPE)];
    }

    // ************************************** Getters and setters **************************************/
    getUuid(): string {
        return this.uuid;
    }

    getTarget(): any {
        return this.target;
    }

    getHtmlTag() {
        return this.target.tagName;
    }
    setTarget(target: any): void {
        this.target = target;
    }

    getName(): string {
        return this.name;
    }

    getAreaId(): string {
        return this.areaId;
    }

    getSchema() {
        return this.schema;
    }

    getSchemaNode() {
        return this.schemaNode;
    }

    getSection(): any {
        return this.section;
    }

    getPath(): Array<string> {
        return this.uuidSectionsPath;
    }

    getSectionsPath(): Array<string> {
        return this.sectionsPath;
    }

    getAttributes(): Object {
        return this.attributes;
    }

    getAttribute(name: string, value: any = null): any {
        return isNil(this.attributes[name]) ? null : this.attributes[name];
    }

    setAttributes(attributes: Object): void {
        this.attributes = attributes;
    }

    setAttribute(name: string, value: Object): void {
        if (name === XeditMapper.TAG_LINK && this.getHtmlTag() === 'IMG ') {
            this.attributes[name] = value;
            this.attributes['src'] = Router.configUrl(Api.getResourceUrl(), { id: value });
        } else if (contains(name, this.getAvailableAttributes())) {
            this.attributes[name] = value;
        }
    }

    getModule() {
        return this.module;
    }

    setModule(module: any) {
        this.module = module;
    }

    /********************** EVENTS *********************/
    public beforeSelect() {
        if (!isNil(this.module) && typeof (this.module.prototype['beforeSelect'] === 'function')) {
            this.module.prototype.beforeSelect();
        }
    }
    public beforeUnselect() {
        if (!isNil(this.module) && typeof this.module.prototype['beforeUnselect'] === 'function') {
            this.module.prototype.beforeUnselect();
        }
    }
    public afterSelect() {
        if (!isNil(this.module) && typeof (this.module.prototype['afterSelect'] === 'function')) {
            this.module.prototype.afterSelect();
        }
    }
    public afterUnselect() {
        if (!isNil(this.module) && typeof (this.module.prototype['afterUnselect'] === 'function')) {
            this.module.prototype.afterUnselect();
        }
    }

    /********************** PUBLIC METHODS *********************/

    getType() {
        let type = Node.TYPE_OTHER;
        if (equals('img', this.name)) {
            type = Node.TYPE_IMAGE;
        } else if (equals('video', this.name)) {
            type = Node.TYPE_VIDEO;
        }
        return type;
    }

    /**
     *
     */
    getAvailableAttributes() {
        let attrName = this.name;
        let auxTag = null;
        if (this.getAttribute(XeditMapper.TAG_LINK, null) != null) {
            attrName = XeditMapper.TAG_LINK;
            auxTag = this.name;
        } else if (this.getAttribute(XeditMapper.TAG_SECTION_TYPE, null) != null) {
            attrName = this.getAttribute(XeditMapper.TAG_SECTION_TYPE);
        }

        return XeditMapper.getAvailableAttribute(attrName, auxTag);
    }

    /*********************** STATIC METHODS ***************************************/
    static getContainer(element, attribute = XeditMapper.TAG_SECTION_TYPE) {
        let container = null;

        if (!isNil(element) && element.hasAttribute(attribute)) {
            container = element;
        }

        return !isNil(container) || isNil(element) || isNil(element.parentNode)
            ? container
            : Node.getContainer(element.parentNode, attribute);
    }

    /**
     * Calculate uuid path to xedit node
     */
    static getContextPath(
        element,
        rootTag = XeditMapper.TAG_EDITOR,
        hasAttribute = XeditMapper.TAG_UUID,
        attribute = XeditMapper.TAG_UUID,
        path = [],
        onlyAttribute = false,
        rootTagIncluded = false
    ) {
        const parent = element.parentNode;

        if (
            (!isNil(element) &&
                (!onlyAttribute || element.hasAttribute(hasAttribute)) &&
                element.nodeName.toLowerCase() !== rootTag) ||
            rootTagIncluded
        ) {
            const uuid = element.getAttribute(attribute);
            if (!isNil(uuid)) {
                path.unshift(uuid);
            }
        }

        return element.nodeName.toLowerCase() === rootTag || isNil(parent)
            ? path
            : this.getContextPath(parent, rootTag, hasAttribute, attribute, path, onlyAttribute, rootTagIncluded);
    }

    /**
     * Get section name according to the language
     *
     * @param section
     * @param lang
     */
    static getSectionLang(section, lang) {
        let name = null;
        if (!isNil(section)) {
            if (hasIn('lang', section) && is(Object, section.lang) && hasIn(lang, section.lang)) {
                name = section.lang[lang];
            } else if (hasIn('name', section)) {
                name = section.name;
            }
        }
        return name;
    }

    /**
     * Get section template
     *
     * @param section
     */
    static getSectionTemplate(section) {
        let template = null;
        if (hasIn('view', section) && is(String, section.view)) {
            template = Converters.json2html(Converters.html2json(section.view));
        }
        return template;
    }
}
