export type Imagen = { url_imagen: string; es_principal: boolean; };
export type Vehiculo = {
  marca: string; modelo: string; año?: number;
  descripcion?: string; condicion?: string; combustible?: string;
  kilometraje?: number; tipo?: string; transmision?: string;
};
export type Publicacion = {
  id_publicacion: number;
  vehiculo: Vehiculo;
  precio: number;
  telefono_contacto: string;
  id_usuario: number;
  estado?: string; destacado?: boolean;
  imagenes: Imagen[];
};
export type LoginIn = { email: string; password: string; };
export type LoginOut = {
  id: number; name: string; email: string; phone?: string | null;
  role: "user" | "admin" | "superadmin";
  access_token?: string; token_type?: string;
  lastModifiedByAdmin?: number; lastLoginTime?: number; adminModifiedFields?: string[];
};
