class VirtualPage {
    constructor(name, stylesheet, onL, onD) {
        this.name = name;
        this.stylesheet = stylesheet;
        this.onL = onL;
        this.onD = onD;
    }

    load(){
        document.getElementById(this.name).hidden = false;
        document.getElementById('dynamic_css').setAttribute('href', this.stylesheet);
        this.onL();
    }

    unload(){
        document.getElementById(this.name).hidden = true;
        this.onD();
    }
}

class VirtualPageManager{
    constructor(defaultPage){
        this.pages = new Map();
        this.pages.set(defaultPage.name, defaultPage);
        defaultPage.load();
    }

    registerPage(vPage){
        this.pages.set(vPage.name, vPage);
    }

    swapTo(name){
        const target = this.pages.get(name);
        this.pages.forEach(function (key, value) {
            if(value.name !== target.name)
                value.unload();
        });
        target.load();
    }
}