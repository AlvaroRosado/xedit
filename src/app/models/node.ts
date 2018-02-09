import { equals, isNil, contains, props, reduce, hasIn, is } from 'ramda';
import { XeditMapper } from './schema/xedit-mapper';
import { Converters } from '../../utils/converters';

export class Node {

    static TYPE_IMAGE = 'image';
    static TYPE_VIDEO = 'video';
    static TYPE_OTHER = 'video';

    // Variables
    private areaId;
    private uuid: string;
    private target: HTMLElement;
    private schema: any;
    private schemaParent: any;
    private name: string;
    private section: any;
    private attributes: Object;
    private uuidSectionsPath: Array<string>;
    private sectionsPath: Array<string>;

    // Constructor
    constructor(uuid: string, target: any, schemas: any, attributes: Object = {}) {
        if (isNil(uuid) || isNil(name)) {
            throw new TypeError('Invalid arguments');
        }

        this.uuid = uuid;
        this.name = target.tagName;
        this.target = target;
        this.section = Node.getContainer(this.target);
        this.uuidSectionsPath = Node.getContextPath(this.target);
        this.sectionsPath = Node.getContextPath(this.target, XeditMapper.TAG_EDITOR, XeditMapper.TAG_SECTION_TYPE, [], true);
        this.areaId = this.uuidSectionsPath.shift();
        this.attributes = attributes;

        const { schema, schemaParent } = this.getSchemas(schemas);
        this.schema = schema;
        this.schemaParent = schemaParent;
    }

    // ************************************** Getters and setters **************************************/
    getUuid(): string {
        return this.uuid;
    }

    getTarget(): any {
        return this.target;
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

    getSchema(): string {
        return this.schema;
    }

    getSchemaParent(): string {
        return this.schemaParent;
    }

    getSection(): any {
        return this.section;
    }

    getPath(): Array<string> {
        return this.uuidSectionsPath;
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
        if (name === XeditMapper.TAG_IMAGE) {
            this.attributes[name] = value;
            this.attributes['src'] = 'http://ajlucena.com/ximdex-4/public_xmd/?action=filemapper&method=nodeFromExpresion&expresion='
                + value;
        } else if (contains(name, this.getAvailableAttributes())) {
            this.attributes[name] = value;
        }
    }
    /********************* PRIVATE METHODS *********************/
    /**
     * Get schema and parent schema by specific DOM element
     *
     * @param element
     */
    private getSchemas(schemas) {
        /** @todo Corregir obtener ruta */

        let schema = schemas[this.areaId];
        let schemaParent = null;

        // Get schema
        schema = reduce(function (sect, value) {
            schemaParent = sect;
            return sect.sections[value];
        }, schema, this.sectionsPath);

        return { schema, schemaParent };
    }
    /********************** PUBLIC METHODS *********************/

    getType() {
        let type = Node.TYPE_OTHER;
        if (equals('img', this.name.toLowerCase())) {
            type = Node.TYPE_IMAGE;
        } else if (equals('video', this.name.toLowerCase())) {
            type = Node.TYPE_VIDEO;
        }
        return type;
    }

    getAvailableAttributes() {
        let attributes = [];
        if (equals(this.getType(), Node.TYPE_IMAGE) && !isNil(this.getAttribute(XeditMapper.TAG_IMAGE))) {
            attributes = [XeditMapper.TAG_IMAGE, 'width', 'height', 'xe_uuid'];
        } else if (equals(this.getType(), Node.TYPE_IMAGE)) {
            attributes = ['src', 'alt', 'style', 'xe_uuid'];
        } else {
            attributes = ['id', 'class', 'style', 'xe_uuid'];
        }
        return attributes;
    }


    /*********************** STATIC METHODS ***************************************/
    static getContainer(element, attribute = XeditMapper.TAG_SECTION_TYPE) {
        let container = null;

        if (!isNil(element) && element.hasAttribute(attribute)) {
            container = element;
        }

        return !isNil(container) || isNil(element) || isNil(element.parentNode) ?
            container : Node.getContainer(element.parentNode, attribute);
    }

    /**
     * Calculate uuid path to xedit node
     */
    static getContextPath(element, rootTag = XeditMapper.TAG_EDITOR, attribute = XeditMapper.TAG_UUID, path = [], onlyAttribute = false) {
        const parent = element.parentNode;

        if (!isNil(element) && (!onlyAttribute || element.hasAttribute(attribute))) {
            path.unshift(element.getAttribute(attribute));
        }

        return (element.nodeName.toLowerCase() === rootTag || isNil(parent)) ?
            path : this.getContextPath(parent, rootTag, attribute, path, onlyAttribute);
    }



    /**
     * Get section name according to the language
     *
     * @param section
     * @param lang
     */
    static getSectionLang(section, lang) {
        let name = section.name;
        if (hasIn('lang', section) && is(Object, section.lang) && hasIn(lang, section.lang)) {
            name = section.lang[lang];
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
        if (hasIn('template', section) && is(String, section.template)) {
            template = Converters.json2html(Converters.html2json(section.template));
        }
        return template;
    }
}