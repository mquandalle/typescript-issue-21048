import { merge, compose } from "ramda";

export interface IFilterableOffer<T> {
  id: string;
  getFilterCriterias(query: T): Object;
  getCard: React.ClassicComponentClass<{ query?: T }>;
}

export interface ForfaitMobileQuery {
  /**
   * En minutes
   */
  calls: number;
  /**
   * En Megaoctes
   */
  data: number;
  isPromotion: boolean;
}

export type Quantity =
  | number
  | {
      kind: "capped";
      included: number;
      overRate: number;
    }
  | {
      kind: "linear";
      rate: number;
    }
  | {
      kind: "fairUse";
      included: number;
    }
  | {
      kind: "recharges";
      included: number;
      recharges: Array<[number, number]>;
    };

export interface MobileOfferDescriptor {
  id: string;
  price: number;
  simCardPrice: number;
  dataUE: number;
  promotion?: {
    until: string;
    text: JSX.Element;
    characteristics: MobileOfferPartialDescriptor;
  };
  calls: Quantity;
  sms: number;
  mms: number;
  data: Quantity;
  operateur: Operateur;
  paragraphs?: Array<ExtraParagraph>;
}

interface Operateur {
  logo: string;
  color: string;
}

interface ExtraParagraph {
  iconId: string;
  content: string;
}

export type ForfaitMobileOffer = IFilterableOffer<ForfaitMobileQuery>;

type PartialDescriptorFactory = (
  context?: MobileOfferPartialDescriptor,
  query?: Object,
) => MobileOfferPartialDescriptor;

type PartialDescriptor<T> = { [P in keyof T]?: T[P] & PartialDescriptor<T[P]> };

type MobileOfferPartialDescriptor = PartialDescriptor<MobileOfferDescriptor>;

export function createOffer(
  ...descriptors: Array<PartialDescriptorFactory>
): ForfaitMobileOffer {
  let adt: MobileOfferPartialDescriptor = {};
  const query = {};
  descriptors.forEach(d => (adt = d(adt, query)));
  // @TODO Assert descriptor is correct -- with MST?
  // XXX We should use a runtime typeguard here
  return new MobileOffer(adt as MobileOfferDescriptor);
}

export const id = (id: string) => merge({ id });

export const price = (price: number) => merge({ price });

export const simCardPrice = (simCardPrice: number): PartialDescriptorFactory =>
  merge({ simCardPrice });

export const capped = (included: number, overRate: number): Quantity => ({
  kind: "capped",
  included,
  overRate,
});

export const linear = (rate: number): Quantity => ({
  kind: "linear",
  rate,
});

export const recharges = (
  included: number,
  recharges: Array<[number, number]>,
): Quantity => ({
  kind: "recharges",
  included,
  recharges,
});

export const fairUse = (included: number): Quantity => ({
  kind: "fairUse",
  included,
});

export function calls(
  included: number,
  overRate?: number,
): PartialDescriptorFactory;
export function calls(callsCharacteristics: Object): PartialDescriptorFactory;
export function calls(
  amount: string | number,
  overRate?: number,
): PartialDescriptorFactory {
  if (typeof amount === "number" && typeof overRate === "number") {
    return merge({ calls: capped(amount, overRate) });
  }
  throw new Error("Invalid call definition");
  // return merge({ calls: amount });
}

export function data(included: number): PartialDescriptorFactory;
export function data(
  included: number,
  overRate: number,
): PartialDescriptorFactory;
export function data(dataCharacteristics: Object): PartialDescriptorFactory;
export function data(
  amount: string | number,
  extra?: Object,
): PartialDescriptorFactory {
  if (typeof amount === "number" && typeof extra === "undefined") {
    return merge({ data: fairUse(amount) });
  } else if (typeof amount === "number" && typeof extra === "number") {
    return merge({ data: capped(amount, extra) });
  }
  return merge({ data: amount });
}

export const dataUE = (included: number): PartialDescriptorFactory =>
  merge({ dataUE: included });

export const promotion = ({
  until,
  text,
  characteristics,
}: {
  until: string;
  text: JSX.Element;
  characteristics: PartialDescriptorFactory;
}): PartialDescriptorFactory =>
  merge({
    promotion: {
      until,
      text,
      characteristics: characteristics({}),
    },
  });

export const unlimitedCalls = (): PartialDescriptorFactory =>
  merge({
    calls: Infinity,
  });

export const unlimitedSMS = (): PartialDescriptorFactory =>
  merge({
    sms: Infinity,
  });

export const unlimitedMMS = (): PartialDescriptorFactory =>
  merge({
    mms: Infinity,
  });

export const unlimitedCommunications = (): PartialDescriptorFactory =>
  compose(unlimitedCalls(), unlimitedSMS(), unlimitedMMS());

export const operateur = (operateur: Operateur): PartialDescriptorFactory =>
  merge({ operateur });

export const paragraph = (
  iconId: string,
  content: JSX.Element,
): PartialDescriptorFactory =>
  merge({
    paragraphs: [
      {
        iconId: iconId,
        content,
      },
    ],
  });
