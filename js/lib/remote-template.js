const fetchedTemplates = { /* key: template */ };

window.fetchedTemplates = fetchedTemplates;
async function fetchTemplatePart(url) {
    try {
        const response = await fetch(url);
        return await response.text();
    } catch (e) {
        console.error(`Failed to load ${url} with error`, e);
    }
    return '';
}

export async function getRemoteTemplateWithCache(htmlURL = '', stylesURL = '') {
    const key = `${htmlURL}:${stylesURL}`;
    if (fetchedTemplates[key]) {
        return fetchedTemplates[key];
    }

    const html = htmlURL && await fetchTemplatePart(htmlURL);
    const styles = stylesURL && `<style>${await fetchTemplatePart(stylesURL)}</style>`;
    const template =  `${styles ?? ''}${html?? ''}`;

    fetchedTemplates[key] = template;
    return template;
}

export async function getRemoteTemplate(url, withStyles = true) {
    const basePath = new URL(url).pathname.replace(/.js$/, '');
    const templateURL = `${basePath}.html`;
    const stylesURL = withStyles ? `${basePath}.css` : null;

    return await getRemoteTemplateWithCache(templateURL, stylesURL);
}
