describe('Http Component', function () {

    var Q = require('q');
    var nock = require('nock');
    var HttpComponent = require('../lib/httpComponent.js').HttpComponent;
    var messages = require('../lib/messages.js');

    it('should work', function () {

        nock('http://foobarbazbarney.com')
            .get('/api')
            .reply(200, JSON.stringify({
                foo: 'bar',
                baz: 'barney'
            }));


        var emitter = jasmine.createSpyObj('emitter', ['emit']);

        var options = {
            url: 'http://foobarbazbarney.com/api',
            json: true
        };

        function handleResponse(response) {
            return Q(messages.newMessageWithBody(response.body));
        }

        var component = new HttpComponent(emitter)
            .success(handleResponse);

        runAndExpect(
            function () {
                component.exec('get', options);
            },
            function () {
                return emitter.emit.callCount === 2;
            },
            function () {
                var emitCalls = emitter.emit.calls;

                var emitDataArgs = emitCalls[0].args;

                expect(emitDataArgs[0]).toEqual('data');
                expect(emitDataArgs[1].body).toEqual({
                    foo: 'bar',
                    baz: 'barney'
                });

                expect(emitCalls[1].args).toEqual(['end']);
            });
    });

    function runAndExpect(runner, waiter, expector) {

        var next = jasmine.createSpy('next');

        runs(runner);

        waitsFor(waiter, 5000);

        runs(expector);
    }
});