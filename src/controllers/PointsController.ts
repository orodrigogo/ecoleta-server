import {Request, Response} from 'express';
import knex from '../database/connection';

class PointsController {

  async index(request: Request, response: Response){
    const { city, uf, items } = request.query;

    // Separando os items em um array e tirando os espaçamentos da direita e da esquerda de cada item.
    const parsedItems = String(items).split(',').map(item => Number(item.trim()));

    const points = await knex('points')
                        .join('point_items', 'points.id', '=', 'point_items.point_id')
                        .whereIn('point_items.item_id', parsedItems)
                        .where('city', String(city))
                        .where('uf', String(uf))
                        .distinct()
                        .select('points.*'); // Para trazer todos os campos da tabela points. E não da que eu fiz o Join.

    return response.json(points);
  }


  async show(request: Request, response: Response){
    const { id } = request.params;
    const point = await knex('points').where('id', id).first();

    if(!point)
      return response.status(400).json({ message: 'Point not found.'})


    const items = await knex('items')
                        .join('point_items', 'items.id', '=', 'point_items.item_id')
                        .where('point_items.point_id', id)
                        .select('items.title');

    return response.json({
      point,
      items
    });
  }


  async create(request: Request, response: Response){
    
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = request.body;
  
    // Criando a transação.
    const trx = await knex.transaction();

    const point = {
      image: 'image-fake',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    };

   
  
    // Inserindo e pegando os ids retornados. Como inserido apenas um, teremos apenas um id retornado.
    const insertedIds = await trx('points').insert(point);
  
    const point_id = insertedIds[0];
  
    // Registrando na tabela de relacionamento N:N.
    const pointItems = items.map((item_id: number) => {
      return {
        item_id,
        point_id
      };
    });
    await trx('point_items').insert(pointItems);

    // Se der tudo certo, salva no banco. Sempre que usa transaction, precisa dar o commit. O Rollback é feito automaticamente.
    await trx.commit();
  
  
    return response.json({
      id: point_id,
      ...point,
    });
  }

  
}

export default PointsController;