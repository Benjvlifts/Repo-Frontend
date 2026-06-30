// src/__tests__/allServices.test.js
import { describe, test, expect, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import api from '../services/api';

import * as analiticaService from '../services/analiticaService';
import * as notifService from '../services/notifService';
import * as projectService from '../services/projectService';
import * as resourceService from '../services/resourceService';

const mock = new MockAdapter(api);

describe('Suite General de Servicios de la Aplicación', () => {
  beforeEach(() => { mock.reset(); });

  test('analiticaService.getSummary debe obtener el resumen de KPIs', async () => {
    const mockData = { totalProjects: 5, activeProjects: 2 };
    mock.onGet('/api/v1/analitica/resumen').reply(200, mockData);

    const res = await analiticaService.getSummary();
    expect(res).toEqual(mockData);
  });

  test('notifService.getNotifications debe traer las alertas de un proyecto', async () => {
    const mockData = [{ id: 1, message: 'Alerta' }];
    mock.onGet('/api/v1/notificaciones/proyecto/1').reply(200, mockData);

    const res = await notifService.getNotifications(1);
    expect(res).toEqual(mockData);
  });

  test('projectService debe gestionar el CRUD de proyectos', async () => {
    const projectList = [{ id: 1, name: 'Proyecto Alfa' }];
    const newProj = { name: 'Proyecto Beta' };

    mock.onGet('/api/projects/').reply(200, projectList);
    mock.onPost('/api/projects/').reply(201, { id: 2, ...newProj });
    mock.onPut('/api/projects/1').reply(200, { id: 1, name: 'Proyecto Alfa Modificado' });
    mock.onDelete('/api/projects/1').reply(200, { success: true });

    const getRes = await projectService.getProjects();
    expect(getRes).toEqual(projectList);

    const createRes = await projectService.createProject(newProj);
    expect(createRes.id).toBe(2);

    const updateRes = await projectService.updateProject(1, { name: 'Proyecto Alfa Modificado' });
    expect(updateRes.name).toContain('Modificado');

    await expect(projectService.deleteProject(1)).resolves.not.toThrow();
  });

  test('resourceService debe gestionar el CRUD de recursos', async () => {
    const resourceList = [{ id: 10, name: 'Desarrollador Senior' }];
    const newRes = { name: 'Diseñador UI' };

    mock.onGet('/api/resources/').reply(200, resourceList);
    mock.onPost('/api/resources/').reply(201, { id: 11, ...newRes });
    mock.onPatch('/api/resources/10/availability').reply(200, { id: 10, available: false });
    mock.onDelete('/api/resources/10').reply(200, { success: true });

    const getRes = await resourceService.getResources();
    expect(getRes).toEqual(resourceList);

    const createRes = await resourceService.createResource(newRes);
    expect(createRes.id).toBe(11);

    const updateRes = await resourceService.updateAvailability(10, false);
    expect(updateRes.available).toBe(false);

    await expect(resourceService.deleteResource(10)).resolves.not.toThrow();
  });
});