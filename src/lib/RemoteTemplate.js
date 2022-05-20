export class RemoteTemplate {
    constructor(root, templateURL, stylesURL) {
        this.root = root;
        this.templateURL = templateURL;
        this.stylesURL =  stylesURL;
    }

    async load() {
        const template = this.templateURL && await this.fetchTemplate(this.templateURL);
        const styles = this.stylesURL && await this.fetchStyles(this.stylesURL);

        this.root.innerHTML = `${styles ?? ''}${template ?? ''}`;
    }

    async fetchTemplate(url) {
        try {
            const response = await fetch(url);
            return await response.text();
        } catch (e) {
            console.error('Failed to load template', e);
        }
    }

    async fetchStyles(url) {
        try {
            const response = await fetch(url);
            const styles  = await response.text();
            return `<style>${styles}</style>`;
        } catch (e) {
            console.error('Failed to load styles', e);
        }
    }
}
