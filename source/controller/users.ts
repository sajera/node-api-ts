
// outsource dependencies

// local dependencies
import { APIController, APIEndpoint, Swagger, API_METHOD, BaseController, Auth } from './base';

/**
 * Implement user CRUD and may be extended by user specific actions
 */
@APIController({ path: '/users' })
export default class Users extends BaseController {

  @Auth({ self: true })
  @Swagger({ summary: 'Get filtered list of users' })
  @APIEndpoint({ path: '/filter', method: API_METHOD.POST })
  public async filter () {
    // TODO get filtered page with users
    const data = await (new Promise((resolve, reject) => {
      // reject({error: true});
      resolve({
        page: 0,
        size: 10,
        content: [],
        totalPages: 0,
      });
    }));
    await this.response.status(200).type('json').send(data);
  }

  @Swagger({ summary: 'Get user by ID' })
  @APIEndpoint({ path: '/:userId', method: API_METHOD.GET })
  public async byId () {
    const data = await (new Promise((resolve, reject) => {
      // reject({error: true});
      resolve({ get: true });
    }));
    await this.response.status(200).type('json').send(data);
  }

  /**
   * endpoint to create item
   */
  @APIEndpoint({ path: '/', method: API_METHOD.POST })
  public async create () {
    const data = await (new Promise((resolve, reject) => {
      // reject({ error: true });
      resolve({ create: true });
    }));
    await this.response.status(200).type('json').send(data);
  }

  /**
   * endpoint to update item
   */
  @APIEndpoint({ path: '/:id', method: API_METHOD.PUT })
  public async update () {
    const data = await (new Promise((resolve, reject) => {
      // reject({ error: true });
      resolve({ update: true });
    }));
    await this.response.status(200).type('json').send(data);
  }

  /**
   * endpoint to remove item
   */
  @APIEndpoint({ path: '/:id', method: API_METHOD.DELETE })
  public async remove () {
    const data = await (new Promise((resolve, reject) => {
      // reject({ error: true });
      resolve({ remove: true });
    }));
    // NOTE provide ability to transit closing request to caller
    await this.response.status(200).type('json').send(data);
  }

  /**
   * endpoint to remove list item
   */
  @APIEndpoint({ path: '/list', method: API_METHOD.DELETE })
  public async removeList () {
    // TODO get user list from body
    const list = [{ id: '100' }, { id: '200' }];

    await this.response.status(200).type('json').send(list);
  }

}
