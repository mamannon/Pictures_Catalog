class Dataholding {

    clickedNaviButton: boolean;

    constructor() {
//        this.clickedNaviButton = false;
        this.clickedNaviButton = true;
    }

    setClickedNaviButton(data) {
        this.clickedNaviButton = data;
    }

    getClickedNaviButton() {
        return this.clickedNaviButton;
    }

}
export default new Dataholding();