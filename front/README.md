## Running the tests

Starting storybook

```
npm run storybook
```

To run test unit tests

```npm run test```

In case dom test is updated, snapshots can be updated via

```
./node_modules/jest/bin/jest.js -u
```

## Deployment

```
npm run build
```

Then copy the dist folder somewhere