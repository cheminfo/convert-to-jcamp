export interface SpectrumInfo {
  /**
   * title of the file
   * @default ''
   */
  title?: string;
  /**
   * owner of the file
   * @default ''
   */
  owner?: string;
  /**
   * origin of the file
   * @default ''
   */
  origin?: string;
  /**
    * type of data
    * @default ''
    */
  dataType?: string;
  /**
   * units for the x axis for variables===undefined
   * @default ''
  */
  xUnits?: string;
  /**
   * units for the y axis for variables===undefined
   * @default ''
  */
  yUnits?: string;
  /**
  * factor to multiply X value
  * @default 1
 */
  xFactor?: number;
  /**
   * factor to multiply X value
   * @default 1
  */
  yFactor?: number;
}

export default interface JcampOptions {
  /**
   * metadata of the file
   * @default {}
   */
  info?: SpectrumInfo;
  /**
   * comments to add to the file
   * @default {}
   */
  meta?: Record<string, any>;
  /**
   * force the ntuples format even if there is only x and y variables
   * @default false
   */
  forceNtuples?: boolean;
  /**
   * Use XYDATA format. Will use first / last X and equidistant Xs values if true
   * @default false
   */
  xydata?: boolean;
}
