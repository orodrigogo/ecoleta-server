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



    const serializedPoints = points.map(point => {
      return {
        ...point,
        image_url: `http://192.168.1.12:3333/uploads/${point.image}`,
      };
    });

    return response.json(points);
  }


  async show(request: Request, response: Response){
    const { id } = request.params;
    const point = await knex('points').where('id', id).first();

    if(!point)
      return response.status(400).json({ message: 'Point not found.'})


    const serializedPoint = {      
        ...point,
        image_url: `http://192.168.1.5:3333/uploads/${point.image}`,
      };



    const items = await knex('items')
                        .join('point_items', 'items.id', '=', 'point_items.item_id')
                        .where('point_items.point_id', id)
                        .select('items.title');



                        

    return response.json({
      point: serializedPoint,
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
      image: request.file.filename,
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
    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
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