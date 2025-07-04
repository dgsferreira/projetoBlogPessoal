/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// test/usuario.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupApp } from './app';
import { App } from 'supertest/types';

let app: INestApplication<App>;
let token: string;
let usuarioId: number;

describe('Usuário e Auth (e2e)', () => {
  beforeAll(async () => {
    app = await setupApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('01 - Deve cadastrar um novo usuário', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({
        nome: 'Root',
        usuario: 'root@root.com',
        senha: 'rootroot',
        foto: '-',
      })
      .expect(201);

    usuarioId = resposta.body.id;
  });

  it('02 - Deve apresentar erro ao cadastrar o usuário com e-mail inválido', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({
        nome: 'Root',
        usuario: 'root@root',
        senha: 'rootroot',
        foto: '-',
      });

    expect(resposta.status).toBe(400);
  });

  it('03 - Não deve cadastrar um usuário duplicado', async () => {
    await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({
        nome: 'Root',
        usuario: 'root@root.com',
        senha: 'rootroot',
        foto: '-',
      })
      .expect(400);
  });

  it('04 - Deve autenticar o usuário (login)', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/usuarios/logar')
      .send({
        usuario: 'root@root.com',
        senha: 'rootroot',
      })
      .expect(200);

    token = resposta.body.token;
  });

  it('05 - Deve listar todos os usuários', async () => {
    const resposta = await request(app.getHttpServer())
      .get('/usuarios/all')
      .set('Authorization', `${token}`)
      .expect(200);

    expect(Array.isArray(resposta.body)).toBe(true);
  });

  it('06 - Deve atualizar um usuário', async () => {
    const resposta = await request(app.getHttpServer())
      .put('/usuarios/atualizar')
      .set('Authorization', `${token}`)
      .send({
        id: usuarioId,
        nome: 'Root Atualizado',
        usuario: 'root@root.com',
        senha: 'rootroot',
        foto: '-',
      })
      .expect(200);

    expect(resposta.body.nome).toBe('Root Atualizado');
  });
});
