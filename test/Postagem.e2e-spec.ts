/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupApp } from './app';
import { App } from 'supertest/types';

let app: INestApplication<App>;
let token: string;
let usuarioId: number;
let temaId: number;
let postagemId: number;

describe('Postagem (e2e)', () => {
  beforeAll(async () => {
    app = await setupApp();

    // Cadastrar usuário
    const userRes = await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({
        nome: 'Root',
        usuario: 'root@root.com',
        senha: 'rootroot',
        foto: '-',
      });

    usuarioId = userRes.body.id;

    // Autenticar
    const login = await request(app.getHttpServer())
      .post('/usuarios/logar')
      .send({ usuario: 'root@root.com', senha: 'rootroot' });

    token = login.body.token;

    // Criar tema
    const temaRes = await request(app.getHttpServer())
      .post('/temas')
      .set('Authorization', `${token}`)
      .send({ descricao: 'Tema para Postagem' });

    temaId = temaRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('01 - Deve cadastrar uma nova Postagem', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/postagens')
      .set('Authorization', `${token}`)
      .send({
        titulo: 'Título Teste',
        texto: 'Texto da postagem',
        tema: { id: temaId },
        usuario: { id: usuarioId },
      })
      .expect(201);

    postagemId = resposta.body.id;
    expect(resposta.body.titulo).toBe('Título Teste');
  });

  it('02 - Deve listar todas as Postagens', async () => {
    const resposta = await request(app.getHttpServer())
      .get('/postagens')
      .set('Authorization', `${token}`)
      .expect(200);

    expect(Array.isArray(resposta.body)).toBe(true);
  });

  it('03 - Deve buscar Postagem por Título', async () => {
    const resposta = await request(app.getHttpServer())
      .get('/postagens/titulo/Título Teste')
      .set('Authorization', `${token}`)
      .expect(200);

    expect(resposta.body[0].titulo).toBe('Título Teste');
  });

  it('04 - Deve atualizar uma Postagem', async () => {
    const resposta = await request(app.getHttpServer())
      .put('/postagens')
      .set('Authorization', `${token}`)
      .send({
        id: postagemId,
        titulo: 'Título Atualizado',
        texto: 'Texto atualizado',
        tema: { id: temaId },
        usuario: { id: usuarioId },
      })
      .expect(200);

    expect(resposta.body.titulo).toBe('Título Atualizado');
  });

  it('05 - Deve deletar uma Postagem', async () => {
    await request(app.getHttpServer())
      .delete(`/postagens/${postagemId}`)
      .set('Authorization', `${token}`)
      .expect(204);
  });
});
