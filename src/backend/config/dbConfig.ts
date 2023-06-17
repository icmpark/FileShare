import { registerAs } from "@nestjs/config";


export default registerAs('database', () => ({
  service: 'database',
  mongodb: {
    auth: {
      user: 'mguser',
      pass: 'mgpass',
    },
    addr: 'localhost',
    port: '27017',
    name: 'filesharing'
  },
  redis: {
    addr: 'localhost',
    port: '6379',
    TTL: 60 * 60
  }
}));


