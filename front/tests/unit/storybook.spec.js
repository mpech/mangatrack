import registerRequireContextHook from 'babel-plugin-require-context-hook/register'
import initStoryshots from '@storybook/addon-storyshots'
jest.mock('moment', () => () => ({ fromNow: () => '2 days ago', format: () => '3 days ago' }))
registerRequireContextHook()
initStoryshots()
