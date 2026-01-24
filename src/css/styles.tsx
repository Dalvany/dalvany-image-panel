import { css } from '@emotion/css'

export const main_container = css` 
  overflow: hidden;
  overflow-y: auto;
  height: 100%;
`;

export const no_slideshow = css`
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
`;

export const div_container = css`
  display: flex;
  flex-direction: column;
  margin: 5px;
`;

export const image = css`
    object-fit: contain;
    display: block;
    flex: none;
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
`;

export const top_left_overlay = css`
    top: 0;
    left: 0;
`

export const top_right_overlay = css`
    top: 0;
    right: 0;
`

export const bottom_left_overlay = css`
    bottom: 0;
    left: 0;
`

export const bottom_right_overlay = css`
    bottom: 0;
    right: 0;
`

export const slideshow_wrapper = css`
    height: 100%;
    & div {
        height: inherit;
    }
`;
