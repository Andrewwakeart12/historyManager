import ChangesHistory from "./ChangesHistory";

class HistoryManager {
    private mutationObserverObject: any = null;
    private container: any;
    public history: ChangesHistory = new ChangesHistory();
    public observer: any = null;
    private conf: any = null;
    //a snapshot of the dom tree
    constructor(container: string) {
        try {
            let finalConf = { childList: true, subtree: true, attributes: true, characterData: true, characterDataOldValue: true, attributesOldValue: true, };
            let finalContainer = this.getContainer(container)
            this.mutationObserverObject = new MutationObserver(this.processMutation.bind(this));
            this.container = finalContainer;
            this.conf = finalConf;
            this.observer = this.mutationObserverObject.observe(this.container, finalConf);
        } catch (error) {
            console.error(error);
        }
    }
    private processMutation(mutationObject: any) {
        //verify if mutation object its array
        if (Array.isArray(mutationObject)) {
            //verify if mutation object its array
            for (let i = 0; i < mutationObject.length; i++) {
                this.processMutation(mutationObject[i]);
            }
            return true;
        }
        switch (mutationObject.type) {
            case "childList":
                this.processChildList(mutationObject);
                break;
            case "attributes":
                this.processAttributes(mutationObject);
                break;
            default:
                console.error('Mutation Type not detected or unavaible ' + mutationObject.type);
                break;
        }
    }
    private getContainer(containerString: string): Node {
        let DOMEl = document.querySelector(containerString);
        if (DOMEl != null) {
            let node = DOMEl.firstChild?.parentNode;
            if (node != null) {
                return node;
            } else {
                throw new Error("Error : Main container Node not found please check the dom structure");
            }
        } else {
            throw new Error("Error : Main container its Null");
        }
    }
    private processChildList(childListItem: any) {
        //verify if added nodes has items
        if (childListItem.addedNodes.length > 0) {
            //verify if added nodes has items
            this.history.addChange({
                "type": "process_child_add",
                "node": childListItem.addedNodes[0].outerHTML,
                "parentNode": childListItem.target
            }, "add")
        } else if (childListItem.removedNodes.length > 0) {
            this.history.addChange(
                {
                    "type": "process_child_remove",
                    "node": childListItem.removedNodes[0].outerHTML,
                    "parentNode": childListItem.target,

                }, 'remove')
        }

    }
    private processAttributes(attributeList: any) {
        //verify if attribute still exist
        if (attributeList.target.hasAttribute(attributeList.attributeName) != false) {
            //verify if attribute exist right now 
            if (attributeList.target.hasAttribute(attributeList.attributeName)) {

                //verify if attribute its in history list
                let attributeExist = this.history.attributeItsInHistory(attributeList.attributeName, attributeList.target.getAttribute(attributeList.attributeName));
                if (attributeExist) {
                    let oldValue = this.history.getLastAttributeFromHistory(attributeList.attributeName);
                    this.history.addChange({
                        "type": "attribute_update",
                        "node": attributeList.target,
                        "attributeName": attributeList.attributeName,
                        "value": attributeList.target.getAttribute(attributeList.attributeName),
                        "oldValue": oldValue != null ? oldValue.change.value : null,
                    }, 'update')
                } else {
                    this.history.addChange({
                        "type": "attribute_added",
                        "node": attributeList.target,
                        "attributeName": attributeList.attributeName,
                        "value": attributeList.target.getAttribute(attributeList.attributeName),
                    }, 'add');
                }
            } else {
                //verify if attribute was in history
                let attributeExist = this.history.attributeItsInHistory(attributeList.attributeName, null)
                if (attributeExist) {
                    this.history.addChange({
                        "type": "attribute_deleted",
                        "node": attributeList.target,
                        "attributeName": attributeList.attributeName,
                        "value": attributeList.target.getAttribute(attributeList.attributeName),
                    }, 'deleted');
                }
            }
        } else {
            let oldValue = this.history.getLastAttributeFromHistory(attributeList.attributeName);
            console.log("attributeList");
            console.log(attributeList);
            this.history.addChange({
                "type": "attribute_removed",
                "node": attributeList.target,
                "attributeName": attributeList.attributeName,
                "value": attributeList.target.getAttribute(attributeList.attributeName),
                "oldValue": attributeList.oldValue != null ? attributeList.oldValue : oldValue != null ? oldValue.change.value : null,
            }, 'remove');
        }
    }
    public stopObserver() {
        this.mutationObserverObject.disconnect();
    }
    public resumObserver() {
        this.mutationObserverObject.observe(this.container, this.conf);
    }
    public undo() {
        this.stopObserver();
        let undoedChange = this.history.undo();
        console.log("undoedChange")
        console.log(undoedChange)
        if (undoedChange === false) {
            this.resumObserver();
            return false;
        }
        switch (undoedChange.type) {
            case "remove":
                switch (undoedChange.change.type) {
                    case "process_child_remove":
                        this.undoRemoveChild(undoedChange)
                        break;
                    case "attribute_removed":
                        this.undoRemoveAttribute(undoedChange);
                        break;
                }
                break;
            case "add":
                switch (undoedChange.change.type) {
                    case "process_child_add":
                        this.undoAddChild(undoedChange)
                        break;
                    case "attribute_added":
                        this.undoAddAttribute(undoedChange);
                        break;
                }
                break;
            case "update":
                switch (undoedChange.change.type) {
                    case "attribute_update":
                        this.undoUpdateAttribute(undoedChange);
                        break;
                }
        }
        this.resumObserver();
    }
    public undoAll(blockRef: string) {

    }
    public undoRemoveChild(undoedChange: any) {
        //append html to parent node 
        try {
            let parent = undoedChange.change.parentNode;
            parent.innerHTML += undoedChange.change.node;
        } catch (e) {
            throw new Error("Error : Error While undoing remove child");
        }

    }
    public undoRemoveAttribute(undoedChange: any) {
        try {
            undoedChange.change.node.setAttribute(undoedChange.change.attributeName, undoedChange.change.oldValue);
        } catch (e) {
            throw new Error("Error : Error While undoing remove attribute");
        }
    }
    public undoAddChild(undoedChange: any) {
        try {
            let parent = undoedChange.change.parentNode;
            parent.removeChild(undoedChange.change.node);
        } catch (e) {
            throw new Error("Error : Error While undoing add child");
        }
    }
    public undoAddAttribute(undoedChange: any) {
        try {
            undoedChange.change.node.removeAttribute(undoedChange.change.attributeName);
            console.log("undoedChange added attribute")
            console.log(undoedChange)
        } catch (e) {
            throw new Error("Error : Error While undoing add attribute");
        }
    }
    public undoUpdateAttribute(undoedChange: any) {
        try {
            undoedChange.change.node.setAttribute(undoedChange.change.attributeName, undoedChange.change.oldValue);
        } catch (e) {
            throw new Error("Error : Error While undoing update attribute");
        }
    }
}
export default HistoryManager