describe('rules engine (phase 6)', () => {
  it('evaluates rule via rules service facade', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [RulesModule, PrismaModule] }).compile();
    const service = moduleRef.get(RulesService);
    const rule = await service.create({
      name: 'ENTITY_RISK',
      description: 'rise in entities',
      conditions: { type: 'ENTITY_COUNT', operator: 'GREATER_THAN', value: 2 },
      actions: { type: 'CREATE_ALERT', severity: 'MEDIUM' },
    });
    const satisfied = await service.evaluate(rule.id, { entityCount: 10 });
    expect(satisfied).toBe(true);
  });
});