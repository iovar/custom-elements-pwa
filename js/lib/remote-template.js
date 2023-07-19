async function fetchTemplatePart(url) {
    try {
        const response = await fetch(url);
        return await response.text();
    } catch (e) {
        console.error(`Failed to load ${url} with error`, e);
    }
    return '';
}

export async function getRemoteTemplate(templateURL = '', stylesURL = '') {
    const template = templateURL && await fetchTemplatePart(templateURL);
    const styles = stylesURL && `<style>${await fetchTemplatePart(stylesURL)}</style>`;

    return `${styles ?? ''}${template ?? ''}`;
}
