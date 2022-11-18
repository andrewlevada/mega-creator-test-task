import globalStyles from "~styles/global.lit.scss";
import globalPageStyles from "~src/pages/global-styles.lit.scss";
import layoutHelperStyles from "~styles/tiny-layout-helper.lit.scss";
import { unsafeCSS } from "lit";

export const componentStyles = [
	unsafeCSS(globalStyles),
	unsafeCSS(layoutHelperStyles)
];

export const pageStyles = [
	unsafeCSS(globalStyles),
	unsafeCSS(layoutHelperStyles),
	unsafeCSS(globalPageStyles),
];

export const plasmicPublicApiToken = "8dw8cFpzDBK4cZFUBJNuWw:fUcPrXxH2cMp0HZH0j6fNGEi1jcfxuNUE1EhGiTv64QVDVnMteBmectkFnJRdmJqkQWkMP3TujuEjVHnpyQ";
