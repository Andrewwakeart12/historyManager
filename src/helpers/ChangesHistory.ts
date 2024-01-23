class ChangesHistory {
    private history_changes_list: any[] = [];
    private redo_changes_list : any[] = [];
    private id: number = 0;
    public addChange(change: any, type: string) {
        if(this.redo_changes_list.length > 0)
        {
            this.redo_changes_list = [];
        }
        this.history_changes_list.push({ change: change, type: type, id: this.id++ });
        //order history_changes_list by id
        this.history_changes_list = this.history_changes_list.sort((a, b) => a.id - b.id);
    }
    public undo() {
        if (this.history_changes_list.length > 0) {
            let undoedChange = this.history_changes_list.pop();
            //remove from history list
            this.id--;
            this.redo_changes_list.push(undoedChange);
            return undoedChange;
        }else
        {
            return false;
        }
    }
    public getHistory() {
        return this.history_changes_list;
    }
    public  attributeItsInHistory(itemName: string, itemValue: string | null) {
        let exist = false;
         this.history_changes_list.forEach((value) => {
            if (value.change.attributeName == itemName && value.change.value != itemValue) {
                exist = true;
            }
        });
        return exist;
    }
    public getLastAttributeFromHistory(itemName: string) {
        //<get last item added to list iterating in reverse
        let temp_arr =this.history_changes_list;
        return temp_arr.reverse().find(value => value.change.attributeName == itemName);
    }
    public findAllAttributesFromHistory(itemName: string) {
        return this.history_changes_list.filter(value => value.change.attributeName == itemName);
    }
}
export default ChangesHistory