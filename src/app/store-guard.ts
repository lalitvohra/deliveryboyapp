import { Router, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute} from "@angular/router";
import { setStoreService } from './shared/services/set_store.service';

export class StoreGuard implements CanActivateChild {
    return_url: string;
    constructor(private router: Router, private activatedRoute: ActivatedRoute, private set_store_service: setStoreService) {
        
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
       
       //console.log(route);
       //this.return_url = route['_routerState'].url;
       this.return_url = '/' + route.pathFromRoot
       .filter(v => v.routeConfig)
       .map(v => v.routeConfig!.path)
       .join('/');
       console.log(this.return_url);
        if (localStorage.getItem("storeId")) {
            return true;
        } else {                         
                let store_id = route.queryParams.store_id;                
                if(store_id){ 
                    this.set_store_service.setStore(store_id).then(result => {
                        if(result){ 
                        this.router.navigate([this.return_url], {queryParams: route.queryParams});                                             
                        return true;   
                        } else {
                        
                        this.router.navigate(["/choosestore"], {queryParams: route.queryParams});
                        return false;                         
                        }    
                    });                 
                    
                }else {
                    console.log('no store id');
                    this.router.navigate(["/choosestore"], {queryParams: route.queryParams});
                    return false;
                }           
            
        }
    }
}
