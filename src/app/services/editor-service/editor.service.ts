import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { isNil, reduce, is, contains, hasIn } from 'ramda';

import { File } from '@models/file';
import { Node } from '@models/node';
import { XeditMapper } from '@models/schema/xedit-mapper';
import { Converters } from '@utils/converters';
import { Toolbar } from '@app/models/toolbar';

@Injectable()
export class EditorService {
    // variables
    private file: BehaviorSubject<File>; // Change if do or redo only
    private fileState: BehaviorSubject<File>; // Current state content (Change if component change)
    private currentNode: BehaviorSubject<Node>; // Current node
    private currentNodeModify: Subject<Node>; // Change if node is modify
    private loading: BehaviorSubject<boolean>;
    private elementsState: Subject<boolean>;
    private toolbarOptions: Subject<Array<Toolbar>>;

    // Constructor
    constructor() {
        this.file = new BehaviorSubject<File>(null);
        this.fileState = new BehaviorSubject<File>(null);
        this.currentNode = new BehaviorSubject<Node>(null);
        this.currentNodeModify = new Subject<Node>();
        this.loading = new BehaviorSubject<boolean>(false);
        this.elementsState = new BehaviorSubject<boolean>(false);
        this.toolbarOptions = new BehaviorSubject<Array<Toolbar>>([]);
    }

    // ************************************** Getters and setters **************************************/
    setFile(file): void {
        this.file.next(file);
        this.fileState.next(file);
    }

    getFile(): Observable<File> {
        this.file.next(this.fileState.getValue());
        return this.file.asObservable();
    }

    getFileValue(): File {
        this.file.next(this.fileState.getValue());
        return this.file.getValue();
    }

    setFileState(file: File): void {
        this.fileState.next(file);
    }

    getFileState(): Observable<File> {
        return this.fileState.asObservable();
    }

    getFileStateValue(): File {
        return this.fileState.getValue();
    }

    setCurrentNode(node): void {
        this.currentNode.next(node);
    }

    getCurrentNode(): Observable<Node> {
        return this.currentNode.asObservable();
    }

    setCurrentNodeModify(node): void {
        this.currentNodeModify.next(node);
    }

    getCurrentNodeModify(): Observable<Node> {
        return this.currentNodeModify.asObservable();
    }

    setToolbarOptions(options: Array<Toolbar>): void {
        this.toolbarOptions.next(options);
    }

    getToolbarOptions(): Observable<Array<Toolbar>> {
        return this.toolbarOptions.asObservable();
    }

    isLoading() {
        return this.loading.asObservable();
    }

    setLoading(loading: boolean) {
        this.loading.next(loading);
    }

    setElementsState(elementState: boolean): void {
        this.elementsState.next(elementState);
    }

    getElementsState(): Observable<boolean> {
        return this.elementsState.asObservable();
    }

    /************************************** Public Methods **************************************/

    /**
     * Create file from data nodes
     */
    createFile(data): void {
        this.setFile(new File(data));
    }

    /**
     * Added new state
     */
    newStateFile(state: any, message: string): File {
        return this.file.getValue().newStateWithMessage(state, message);
    }

    /**
     * Return to the previous state if it exists, otherwise it does not do anything
     */
    lastStateFile(): Promise<any> {
        return this.file
            .getValue()
            .lastState()
            .then(value => {
                this.setFile(value);
            });
    }

    /**
     * Go to the next state if it exists, otherwise it does not do anything
     */
    nextStateFile(): Promise<any> {
        return this.file
            .getValue()
            .nextState()
            .then(value => {
                this.setFile(value);
            });
    }

    /**
     *
     */
    recoverySnapshot(key: string): void {
        this.getFileStateValue()
            .recovery(key)
            .then(() => {
                this.setFile(this.getFileStateValue());
            });
    }

    /**
     * Save content into document
     *
     * @param node DomNode
     * @param content Html content
     * @param message string message
     */
    save(node, content, message) {
        const fileContent = this.fileState.getValue().getState().content;
        /** @todo Improve performance clone */
        // let fileContent = clone(this.file.getValue().getState().content)
        let uuidPath = null;

        if (is(String, node)) {
            fileContent[node].content = Converters.html2json(content);
        } else {
            uuidPath = EditorService.getUuidPath(node);

            const root = fileContent[uuidPath.shift()];

            if (is(String, root.content)) {
                root.content = Converters.html2json(root.content);
            }

            // Modify file with new changes
            const editContent = reduce(
                (acc, value) => {
                    return acc.child[value];
                },
                root.content,
                uuidPath
            );
            let newContent = Converters.html2json(content, false);
            if (
                hasIn(editContent.uuid, newContent) &&
                hasIn('uuid', newContent[editContent.uuid]) &&
                editContent.uuid === newContent[editContent.uuid].uuid
            ) {
                newContent = newContent[editContent.uuid].child;
            }
            editContent.child = newContent;
        }

        // Save new state
        const newFile = this.newStateFile(fileContent, message);
        this.setFileState(newFile);
    }

    /**
     * Get json node by path
     */
    getJsonNodesByPath(node: Node) {
        const fileContent = this.fileState.getValue().getState().content;

        const root = fileContent[node.getAreaId()];

        if (is(String, root.content)) {
            root.content = Converters.html2json(root.content);
        }

        // Modify file with new changes
        const editContent = reduce(
            function(acc, value) {
                return acc.child[value];
            },
            root.content,
            node.getPath()
        );

        return editContent;
    }

    /**
     * Remove node section
     */
    removeNode(node: Node) {
        const file = this.newStateFile(this.fileState.getValue().getState().content, 'Remove node');
        const section = node.getSection();
        const sectionPath = Node.getContextPath(section);

        let parentNode = null;
        const fileNode = reduce(
            (n, value) => {
                parentNode = n;
                return n.child[value];
            },
            file.getState().getContent()[node.getAreaId()].content,
            sectionPath
        );

        const nodeKey = section.getAttribute(XeditMapper.TAG_UUID);
        delete parentNode.child[nodeKey];

        this.setFileState(file);
    }
    /**
     * Add child or sibling node to area
     *
     * @param node
     * @param target
     * @param child
     */
    addNodeToArea(node: Node, newNode, child: boolean = false) {
        const message =
            (child ? 'Adding child' : 'Adding sibling') + ' to ' + node.getSection().getAttribute('xe_section');
        const file = this.newStateFile(this.fileState.getValue().getState().content, message);
        const section = node.getSection();

        const sectionPath = child ? Node.getContextPath(section) : Node.getContextPath(section.parentNode);

        const fileNode = reduce(
            function(n, value) {
                return n.child[value];
            },
            file.getState().getContent()[node.getAreaId()].content,
            sectionPath
        );

        if (!child) {
            const idChild = section.getAttribute(XeditMapper.TAG_UUID);
            const nodeKey = Object.keys(newNode)[0];
            fileNode.child = reduce(
                function(object, nodeId) {
                    const nodeValue = fileNode.child[nodeId];
                    object[nodeId] = nodeValue;
                    if (nodeId === idChild) {
                        object[nodeKey] = newNode[nodeKey];
                    }
                    return object;
                },
                {},
                Object.keys(fileNode.child)
            );
        } else {
            const nodeKey = Object.keys(newNode)[0];
            fileNode.child[nodeKey] = newNode[nodeKey];
        }

        this.setFileState(file);
    }

    getUpdatedDocument() {
        const file = this.getFileStateValue();
        const state = file.getState();
        const document = { nodes: {} };

        for (const nodeId in state.content) {
            if (hasIn('content', state.content[nodeId])) {
                document['nodes'][nodeId] = {
                    content: Converters.json2html(state.content[nodeId].content, false, false),
                    editable: state.content[nodeId].editable
                };
            }
        }

        if (hasIn('metas', file)) {
            document['metas'] = file['metas'];
        }

        if (hasIn('metadata', file)) {
            document['metadata'] = file['metadata'];
        }

        return document;
    }
    /************************************** Static Methods **************************************/

    /**
     * Parse DomNode to EditorNode
     *
     * @param element DomNode
     * @param path Uuid path
     */
    parseToNode(element) {
        const styles = [];
        const attributes = {};
        let node = null;

        const uuid = element.getAttribute(XeditMapper.TAG_UUID);

        Object.keys(element.attributes).forEach(key => {
            attributes[element.attributes[key].name] = element.attributes[key].value;
        });

        try {
            node = new Node(uuid, element, attributes);
        } catch (e) {
            console.error('This element is not a valid node');
        }
        return node;
    }

    /*
     * Calculate uuid path to xedit node
     */
    static getUuidPath(element, rootTag = XeditMapper.TAG_EDITOR, path = [], onlySections = false) {
        const parent = element.parentNode;

        if (
            !isNil(element) &&
            element.hasAttribute(XeditMapper.TAG_UUID) &&
            (!onlySections || element.hasAttribute(XeditMapper.TAG_SECTION_TYPE))
        ) {
            path.unshift(element.getAttribute(XeditMapper.TAG_UUID));
        }

        return element.nodeName.toLowerCase() === rootTag || isNil(parent)
            ? path
            : this.getUuidPath(parent, rootTag, path);
    }

    /**
     * Check if node has a child section
     */

    /**
     * Check if allow add new child
     */
    static isAllowAddChild(currentNode: Node, section) {
        let valid = false;

        const schema = currentNode.getSchema();
        if (contains(section, Object.keys(schema.sections))) {
            valid = true;
        }

        return valid;
    }

    /**
     * Check if current node support a inserted node
     *
     * @param currentNode Node
     * @param insertedNode Node
     *
     * @returns boolean
     */
    static isInsertedNodeValid(currentNode: Node, insertedNode: Node) {
        const section = insertedNode.getTarget().getAttribute(XeditMapper.TAG_SECTION_TYPE);
        return this.isAllowAddChild(currentNode, section);
    }
}
