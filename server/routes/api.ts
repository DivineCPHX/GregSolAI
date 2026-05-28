import { Router } from 'express'
import { CoinController } from '../controllers/CoinController'
import { RefreshController } from '../controllers/RefreshController'

const router = Router()

// Coin resource — mirrors Laravel's Route::resource()
router.get('/coins', CoinController.index)
router.get('/coins/stats', CoinController.stats)
router.get('/coins/:pairAddress', CoinController.show)

// Refresh endpoint — triggers DexScreener fetch + DB upsert
router.post('/refresh', RefreshController.refresh)

export default router
