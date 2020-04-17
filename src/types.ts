export interface DynamicImageOptions {
  baseUrl: string;
  suffix: string;
  field?: string;
}

export const defaults: DynamicImageOptions = {
  baseUrl: 'http://openweathermap.org/img/wn/',
  suffix: '@2x.png'
};
