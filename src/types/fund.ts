import type { BaseAssetInfo } from "./api";

export type Fund = {
  id: string;
  name: string;
  baseAsset: BaseAssetInfo;
};
