export type Establishment = {
  id: string;
  name: string;
  image: string;
  type: string;
  address: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
  phone: string;
  email: string;
  hours: string;
  active: boolean;
  companyId?: string;
};
