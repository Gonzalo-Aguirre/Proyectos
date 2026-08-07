/**
 * Lista opcional de contactos del equipo para futuras notificaciones por email.
 * Ya no se usa para login: cada persona crea su propia cuenta.
 */
export interface TeamMember {
  id: string;
  name: string;
  email: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "gonzalo-aguirre",
    name: "Gonzalo Aguirre",
    email: "gonzaloaguirredata@gmail.com",
  },
  {
    id: "candelaria-rapisardi",
    name: "Candelaria Rapisardi",
    email: "canderapisardi@gmail.com",
  },
  {
    id: "javier-stumpf",
    name: "Javier Stumpf",
    email: "stumpfjavier@gmail.com",
  },
  {
    id: "gustavo-olariaga",
    name: "Gustavo Olariaga",
    email: "golariaga@gmail.com",
  },
  {
    id: "gustavo-altavista",
    name: "Gustavo Altavista",
    email: "ghaltavista@gmail.com",
  },
  {
    id: "german-cara",
    name: "German Cara",
    email: "german.cara@gmail.com",
  },
];
