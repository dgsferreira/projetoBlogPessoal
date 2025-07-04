/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// test/tema.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupApp } from './app';
import { App } from 'supertest/types';

let app: INestApplication<App>;
let token: string;
let temaId: number;

describe('Tema (e2e)', () => {
  beforeAll(async () => {
    app = await setupApp();

    // Cadastrar usuário e autenticar
    await request(app.getHttpServer()).post('/usuarios/cadastrar').send({
      nome: 'Root',
      usuario: 'root@root.com',
      senha: 'rootroot',
      foto: '-',
    });

    const resposta = await request(app.getHttpServer())
      .post('/usuarios/logar')
      .send({ usuario: 'root@root.com', senha: 'rootroot' });

    token = resposta.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('01 - Deve cadastrar um novo Tema', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/temas')
      .set('Authorization', `${token}`)
      .send({ descricao: 'Tema Teste' })
      .expect(201);

    temaId = resposta.body.id;
    expect(resposta.body.descricao).toBe('Tema Teste');
  });

  it('02 - Deve listar todos os Temas', async () => {
    const resposta = await request(app.getHttpServer())
      .get('/temas')
      .set('Authorization', `${token}`)
      .expect(200);

    expect(Array.isArray(resposta.body)).toBe(true);
  });

  it('03 - Deve buscar tema por descrição', async () => {
    const resposta = await request(app.getHttpServer())
      .get('/temas/descricao/Tema Teste')
      .set('Authorization', `${token}`)
      .expect(200);

    expect(resposta.body[0].descricao).toBe('Tema Teste');
  });

  it('04 - Deve atualizar um Tema', async () => {
    const resposta = await request(app.getHttpServer())
      .put('/temas')
      .set('Authorization', `${token}`)
      .send({ id: temaId, descricao: 'Tema Atualizado' })
      .expect(200);

    expect(resposta.body.descricao).toBe('Tema Atualizado');
  });

  it('05 - Deve deletar um Tema', async () => {
    await request(app.getHttpServer())
      .delete(`/temas/${temaId}`)
      .set('Authorization', `${token}`)
      .expect(204);
  });
});
