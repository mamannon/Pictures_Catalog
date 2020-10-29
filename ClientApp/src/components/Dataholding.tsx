class Dataholding {

    clickedNaviButton: boolean;

    constructor() {
        this.clickedNaviButton = false;
    }

    setClickedNaviButton(data) {
        this.clickedNaviButton = data;
    }

    getClickedNaviButton() {
        return this.clickedNaviButton;
    }

}
export default new Dataholding();