import {Request, Response} from 'express';
import knex from '../database/connection';

class ItemsController {
  async index(request: Request, response: Response){
  // Seleciona todos os campos.
  const items = await knex('items').select('*');

  // Incluindo o endereço da pasta das imagens no retorno dos itens.
  const serializedItems = items.map(item => {
    return {
      id: item.id,
      title: item.title,
      image_url: `http://localhost:3333/uploads/${item.image}`
    };
  });

  return response.json(serializedItems);
    
  }
}

export default ItemsController;