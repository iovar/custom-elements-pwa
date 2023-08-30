const response = await fetch('./config.json');
const config = await response.json();
const BASE_PATH = config.prefixWithPathname
    ? `${location.pathname}${config.LIB_DIR}`
    : `${config.LIB_DIR}`;
export default {
    ...config,
    BASE_PATH,
}
