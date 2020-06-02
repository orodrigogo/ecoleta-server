import express from 'express';
import knex from './database/connection';

const routes = express.Router();

routes.get('/items', async (request, response) => {
  
  // Seleciona todos os campos.
  const items = await knex('items').select('*');

  // Incluindo o endereço da pasta das imagens no retorno dos itens.
  const serializedItems = items.map(item => {
    return {
      title: item.title,
      image_url: `http://localhost:3333/uploads/${item.image}`
    };
  });

  return response.json(serializedItems);
});

export default routes;