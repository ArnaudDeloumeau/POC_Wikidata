
// Définition paramètres graphiques de base

var pos_niv1_Y=70;
var pos_niv2_Y=220;
var pos_niv3_Y=pos_niv2_Y+60;

var rayon_niv2_min=150;
var rayon_niv2_max=300;
var rayon_niv3_min=30;
var rayon_niv3_max=200;

var col_nb_ratio=2;
var col_deb_label=3;
var col_deb_geo=26;
var liste_jeux_donnees=[[],[]];	// ligne 0 : numéros de colonne ; ligne 1 : nom série
liste_jeux_donnees[0][0]=53;
var num_data_max=0.5*(col_deb_geo-col_deb_label-1);
var num_data_max_geo=0.5*(liste_jeux_donnees[0][0]-col_deb_geo-1);

var lig_min_data=3;


var pos_select_X=50;
var larg_box_select=100;
var larg_box_niv2=150;
var pos_niv1_geo_Y=50;
var pos_niv2_geo_Y=pos_niv1_geo_Y+30;
var rayon_geo_min=30;
var rayon_geo_max=160;

var marge_bord=40;
var liste_der_annees=document.createElement('select');
var liste_der_unites=document.createElement('div');
var liste_der_unites_choix=document.createElement('select');

var init_liste_der_annees=0;	// pour mettre l'écouteur d'événement quand on fait la liste déroulante la première fois
var init_liste_der_unites=0;	// pour mettre l'écouteur d'événement quand on fait la liste déroulante sur les unités la première fois
var orig='debut';		// pour retenir d'où on vient
var orig_geo='Monde';	// pour retenir d'où on vient en geo
var vect_popup=[];				// liste des popup ouverts
var isPopupOpen = false;
var csv_vect=[];				// sauvegarde du csv pour écouteur d'événement
var switch_KPI_lieu=0;			// suivi de l'inversion des KPI et de la géographie

// pour pouvoir récupérer les caractéristiques des classes

var liste_classes=['box_select','box_niv1_label','box_niv1_value','box_niv2_label','box_niv2_value','box_niv3_label','box_niv3_value','struct_niv1','struct_niv2','struct_niv3','ovale_niv1','ovale_niv2','ovale_niv3','lien_niv1','box_geog_niv1','box_geog_niv2','lien_niv1_geo','lien_niv2_geo','box_texte_der','lien_niv1_accueil','lien_niv2_accueil','box_niv1_value_seul'];
var liste_boites_texte=['box_niv1_label','box_niv1_value','box_niv2_label','box_niv2_value','box_niv3_label','box_niv3_value','struct_niv1','struct_niv2','struct_niv3','ovale_niv1','ovale_niv2','ovale_niv3','box_geog_niv1','box_geog_niv2','box_niv1_value_seul','box_niv1_unite'];
var tableau_height={};
var tableau_width={};
var tableau_border={};

// récupération des caractéristiques des classes (puis suppression des boîtes)

for (var i=0;i<liste_classes.length;i++) {
	var nouvelleBoite = document.createElement('div');
	nouvelleBoite.classList.add(liste_classes[i]);
	document.body.appendChild(nouvelleBoite);
	var carac = document.querySelector('.' + liste_classes[i]);
	tableau_height[liste_classes[i]]=parseInt(window.getComputedStyle(carac).getPropertyValue('height'));
	tableau_width[liste_classes[i]]=parseInt(window.getComputedStyle(carac).getPropertyValue('width'));
	tableau_border[liste_classes[i]]=parseInt(window.getComputedStyle(carac).getPropertyValue('border'));
	nouvelleBoite.remove();
}

var fileInput = document.getElementById('file-input'); // Remplacez 'file-input' par l'ID de votre champ de fichier
var liste_nom_csvData=[];
var csvData=[];
var file = {};
var id_fichier = [];

fileInput.addEventListener('change', function(e) {
	var nb_files=e.target.files.length;
	for (var i=0;i<nb_files;i++) {
		handleCSVFile(e.target.files[i],function(data) {
			csvData.push(data);
			if (data[0][2]=="Accueil") {
				Mise_a_jour(data,liste_jeux_donnees[0][0],'1',"V0",'1','0','debut','1','G0','0');
			}
		});
		liste_nom_csvData[i]=e.target.files[i].name;
		file[e.target.files[i].name] = e.target.files[i];
	}
	fileInput.remove();
});


function Mise_a_jour(donnees,annee_liste,niv_top, val_box,nb_ss_niv,ss_niv_sup4,orig, niv_top_geo,val_box_geo,numero_jeux_donnees) {
	

	// identifier nombre de jeux de données dans le fichier
	
	
	if (donnees[lig_min_data-1].length<liste_jeux_donnees[0][0]+1) {	// pas de donnnées
		var nb_jeux_donnees=0;
	} else {
		var nb_jeux_donnees=1;
		liste_jeux_donnees[0].splice(1);		// suppression de tous les éléments sauf le premier
		liste_jeux_donnees[1].splice(1);		// suppression de tous les éléments sauf le premier
		liste_jeux_donnees[1][0]=donnees[lig_min_data-1][liste_jeux_donnees[0][0]];
		for (var i=liste_jeux_donnees[0][0];i<donnees[lig_min_data].length;i++) {
			if (donnees[lig_min_data][i]=="" && donnees[lig_min_data][i+1]!="") {
				liste_jeux_donnees[0][nb_jeux_donnees]=i+1;
				liste_jeux_donnees[1][nb_jeux_donnees]=donnees[lig_min_data-1][i+1];
				nb_jeux_donnees++;
			}
		}
	}	
	
	// en cas de label similaires à 1 niveau d'écart, suppression du niveau en doublon ; si valeur non renseignée, vérifier que valeur n'est pas connue au-dessus ou en-dessous
	
	var vecteur_retour=choix_val_csv(donnees,annee_liste, niv_top, val_box,val_box_geo,niv_top_geo,liste_jeux_donnees,numero_jeux_donnees);
	if (vecteur_retour[0][0] ==vecteur_retour[6][0][0] && vecteur_retour[6][0].length==1) {		// s'il y a un seul niveau 2 et que c'est le même que le niveau 1, on descend d'un cran
		var data_values_temp="";
		var index_sens=0;							// va passer à "1" si on descend, "2" si on remonte
		if (orig==vecteur_retour[8][0][0]) {		// on est en train de remonter : remonter de 2 crans
			val_box=val_box.substring(0,val_box.lastIndexOf("."));	// si on clique en haut d'une boîte de niveau 1, on remonte d'un cran
			if (vecteur_retour[7][0][0][annee_liste]!=="" && vecteur_retour[1][0][annee_liste]=="") {		// les valeurs sont inconnues pour le niveau bas : prendre celles du niveau haut.
				index_sens=2;
				var data_values_temp=vecteur_retour[7][0][0];
			}			
		} else {									// on descend de 2 crans
			val_box=vecteur_retour[8][0][0];
			if (vecteur_retour[1][0][annee_liste]!=="" && vecteur_retour[7][0][0][annee_liste]=="") {		// les valeurs sont inconnues pour le niveau bas : prendre celles du niveau haut.
				index_sens=1;
				var data_values_temp=vecteur_retour[1][0];
			}
		}
		var [niv_top, valeur,nb_ss_niv,ss_niv_sup4,val_box_geo,niv_top_geo]=nb_sous_niveaux(donnees,val_box,val_box_geo);
		vecteur_retour=choix_val_csv(donnees,annee_liste, niv_top, val_box,val_box_geo,niv_top_geo,liste_jeux_donnees,numero_jeux_donnees);
		if (index_sens==1) {
			vecteur_retour[1][0]=data_values_temp;
		} else if (index_sens==2) {
			vecteur_retour[7][0][0]=data_values_temp;
		}
	}
	if (typeof vecteur_retour[18][0]!=="undefined" && typeof vecteur_retour[20][0]!=="undefined") {
		if (vecteur_retour[18] ==vecteur_retour[20][0] && vecteur_retour[20].length==1) {		// s'il y a un seul niveau 2 et que c'est le même que le niveau 1, on descend d'un cran
			if (orig==vecteur_retour[21][0]) {		// on est en train de remonter : remonter de 2 crans
				val_box_geo=val_box_geo.substring(0,val_box_geo.lastIndexOf("."));	// si on clique en haut d'une boîte de niveau 1, on remonte d'un cran	
			} else {									// on descend de 2 crans
				val_box_geo=vecteur_retour[21][0];
			}
			var [niv_top, valeur,nb_ss_niv,ss_niv_sup4,val_box_geo,niv_top_geo]=nb_sous_niveaux(donnees,val_box,val_box_geo);
			vecteur_retour=choix_val_csv(donnees,annee_liste, niv_top, val_box,val_box_geo,niv_top_geo,liste_jeux_donnees,numero_jeux_donnees);
		}
	}
	
	if (vecteur_retour[1][0][annee_liste]=="") {		// si pas de valeurs au niveau 1, on cherche au-dessus (attention, faire similaire à la descente si exemples concrets)
		niv_top_temp=niv_top-1;
		val_box_temp=val_box.substring(0,val_box.lastIndexOf("."));
		var vecteur_retour_temp=choix_val_csv(donnees,annee_liste, niv_top_temp, val_box_temp,val_box_geo,niv_top_geo,liste_jeux_donnees,numero_jeux_donnees);	// on sort les données du niveau supérieur
		if (vecteur_retour_temp[6].length==1 && vecteur_retour_temp[0][0]==vecteur_retour_temp[6][0][0] && vecteur_retour_temp[1][0][annee_liste]!=="") {
			vecteur_retour[1]=vecteur_retour_temp[1];		// on prend les valeurs du niveau supérieur
		}
	}
	
	// détail du contenu des 3 niveaux

	
	var data_niv1_label=vecteur_retour[0];
	var data_niv1_values=vecteur_retour[1];
	var data_niv1_id=vecteur_retour[2];
	var data_niv1_type=vecteur_retour[3];
	var data_niv1_source=vecteur_retour[4];
	var data_niv1_source_lien=vecteur_retour[5];
	var data_niv2_label=vecteur_retour[6];
	var data_niv2_values=vecteur_retour[7];
	var data_niv2_id=vecteur_retour[8];
	var data_niv2_type=vecteur_retour[9];
	var data_niv2_source=vecteur_retour[10];
	var data_niv2_source_lien=vecteur_retour[11];
	var data_niv3_label=vecteur_retour[12];
	var data_niv3_values=vecteur_retour[13];
	var data_niv3_id=vecteur_retour[14];
	var data_niv3_type=vecteur_retour[15];
	var data_niv3_source=vecteur_retour[16];
	var data_niv3_source_lien=vecteur_retour[17];
	var data_niv1_geo_label=vecteur_retour[18];
	var data_niv1_geo_id=vecteur_retour[19];
	var data_niv2_geo_label=vecteur_retour[20];
	var data_niv2_geo_id=vecteur_retour[21];



	// détail de la structure des 3 niveaux. "D" ou "" = Data, "V" = Ventilation


	var struct_niv1=[data_niv1_type[0],data_niv1_label.length];
	var struct_niv2=[];
	for (var i=0 ;i<struct_niv1[1];i++) {
		struct_niv2[2*i]=data_niv2_type[i];
		struct_niv2.push(String(data_niv2_label[i].length));
	}
	var struct_niv3=[];
	for (var i=0 ;i<struct_niv1[1];i++) {
		for (var j=0 ;j<struct_niv2[2*i+1];j++) {
			struct_niv3.push(data_niv3_type[i][j]);
			struct_niv3.push(String(data_niv3_label[i][j].length));
		}
	}
	
	// identifier nombre d'années dans le fichier
	var nombre_an=0;
	for (var i=liste_jeux_donnees[0][0];i<donnees[lig_min_data].length;i++) {
		if (donnees[lig_min_data][i]!="") {
			nombre_an++;
		} else {
			break
		}
	}

	
	var boite_niv1=[];
	var boite_niv1_bas_X=[];
	var boite_niv1_bas_Y=[];

	var nb_niv2_prec=0;	// nombre de boîtes de niveau 2 pour décalage

	for (var k=0 ;k<struct_niv1[1];k++) {
		

		if (data_niv1_type=="V") {
			var texte_values_arr_niv1=' ';
		} else if (typeof data_niv1_values[k]=="undefined") {
			var texte_values_arr_niv1='N/A';
		} else {
			var texte_values_arr_niv1=data_arrondi(data_niv1_values[k][annee_liste]);
		}
		[boite_niv1[k],ctr_X,ctr_X_niv2,left_box_niveau1] = ajouterBoite_niv1(donnees,k, data_niv1_label[k],data_niv1_values[k],texte_values_arr_niv1,data_niv1_id[k],data_niv1_source[k],data_niv1_source_lien[k],struct_niv2,struct_niv3,nb_ss_niv,ss_niv_sup4,orig,annee_liste,nombre_an,liste_jeux_donnees,numero_jeux_donnees);

		// replacement de la sélection d'années au bon endroit par rapport à box niveau 1
		var object_select = document.querySelector('.box_select');
		if (object_select!=null) {
			var valeur_select=object_select.value;
			object_select.remove();
		}
		
		if (typeof donnees[lig_min_data][liste_jeux_donnees[0][0]]!=='undefined') {
			left_box_select=pos_select_X+ 'px';
			top_box_select=pos_niv1_Y + 'px';
			var liste_annees=[];
			for (var col=liste_jeux_donnees[0][0]+nombre_an-1; col>=liste_jeux_donnees[0][0];col--) {
				liste_annees.push(donnees[lig_min_data][col]);
			}
			creation_liste_der(donnees,donnees[lig_min_data][annee_liste],left_box_select,top_box_select,liste_annees,'box_select',liste_der_annees);
		}

		boite_niv1_bas_X[k]=boite_niv1[k].offsetLeft + boite_niv1[k].offsetWidth/2;
		boite_niv1_bas_Y[k]=boite_niv1[k].offsetTop + boite_niv1[k].offsetHeight;

		var boite_niv2_vecteur=[];
		var boite_niv2_bas_X=[];
		var boite_niv2_bas_Y=[];
		var boite_niv2_haut_X=[];
		var boite_niv2_haut_Y=[];


		for (var i=0 ;i<struct_niv2[1+2*k];i++) {
			var rayon_niv2=rayon_niv2_min+Math.min(parseInt(struct_niv2[1+2*k]),10)/10*(rayon_niv2_max-rayon_niv2_min)
			
			if (donnees[0][2] == "Accueil" ) {		// si une de ces conditions : niveau 3 à représenter
				var centerX = marge_bord+0.5*tableau_width['box_niv2_value']+(i+nb_niv2_prec)*(tableau_width['box_niv2_value']+ marge_bord);
				var centerY = pos_niv2_Y;
			} else if (nb_ss_niv==2 && ss_niv_sup4==0) {		// si une de ces conditions : niveau 3 à représenter
				var centerY = pos_niv2_Y;
				centerX=ctr_X_niv2[i];
				// if (struct_niv2[1+2*k]==1) {
					// centerX=ctr_X;
				// } else {
					// var rayon_niv3=rayon_niv3_min+Math.min(parseInt(struct_niv3[1]),10)/10*(rayon_niv3_max-rayon_niv3_min);
					// var centerX =marge_bord+rayon_niv3;
					// for (var j=1 ;j<=i;j++) {
						// centerX += marge_bord+rayon_niv3+nb_niv2_prec*(2*marge_bord+2*rayon_niv3);
						// rayon_niv3=rayon_niv3_min+Math.min(parseInt(struct_niv3[1+2*j]),10)/10*(rayon_niv3_max-rayon_niv3_min);
						// centerX += marge_bord+rayon_niv3
					// }
				// }
			} else {
				var angleStep = Math.PI / (parseInt(2*struct_niv2[1+2*k]));
				var angle = Math.PI;
				var pos = getPosition(angle + (2*i+1) * angleStep, rayon_niv2, boite_niv1_bas_X[k], boite_niv1_bas_Y[k]);	// en rond mais pas trop à gauche
				var centerX =pos.x;
				var centerY =pos.y+(tableau_height['struct_niv2']);
			}
			
			if (typeof data_niv2_values[k][i]=="undefined" || typeof data_niv1_values[k]=="undefined") {
				var texte_values_arr_niv2='N/A';
			} else if (JSON.stringify(data_niv2_values[k][i])==JSON.stringify([])) {
				var texte_values_arr_niv2=' ';
			} else {
				var data_type="";
				if (data_niv2_values[k][i][col_nb_ratio]=='ratio' || donnees[lig_min_data-2][annee_liste]=='ratio') {
					data_type='ratio';
				}
				//var texte_values_arr_niv2=data_in_pourcent(parseFloat(data_niv2_values[k][i][annee_liste].replace(' ','')),parseFloat(data_niv1_values[k][annee_liste].replace(' ','')),data_type,liste_jeux_donnees);
				var texte_values_arr_niv2=data_in_pourcent(data_niv2_values[k][i][annee_liste],data_niv1_values[k][annee_liste],data_type,liste_jeux_donnees);
			}
			var boite_niv2 =ajouterBoite_niv2(donnees,data_niv2_label[k][i],data_niv2_values[k][i],texte_values_arr_niv2,data_niv2_id[k][i],data_niv2_source[k][i],data_niv2_source_lien[k][i],nb_ss_niv,ss_niv_sup4,centerX,centerY,orig,annee_liste,nombre_an,liste_jeux_donnees,numero_jeux_donnees);
			
			boite_niv2_vecteur[i]=boite_niv2;
			boite_niv2_haut_X[i]=boite_niv2[0];
			boite_niv2_haut_Y[i]=boite_niv2[1];
			boite_niv2_bas_X[i]=boite_niv2[2];
			boite_niv2_bas_Y[i]=boite_niv2[3];
			boite_niv2_bas_haut=[boite_niv2_haut_X,boite_niv2_haut_Y,boite_niv2_bas_X,boite_niv2_bas_Y];

			addline(boite_niv1_bas_X[k],boite_niv1_bas_Y[k], boite_niv2_haut_X[i],boite_niv2_haut_Y[i]);

			if (nb_ss_niv==2 && ss_niv_sup4==0) {
				
				var nombre_boites=struct_niv3[2*nb_niv2_prec+1+2*i];
				for (var j=0 ;j<nombre_boites;j++) {
					
					
					// vérifier si sous-niveaux à afficher 
					
					var id_graph=data_niv3_id[k][i][j];
					var id_graph_sous_niv=id_graph + '.1';
					var tableau_id_graph=id_graph.split(".");
					var col_sous_niv = col_deb_label+1+2*tableau_id_graph.length;
					var sous_niveau=0;
					for (var row=lig_min_data+1;row<donnees.length-1;row++) {
						if (donnees[row][col_sous_niv]==id_graph_sous_niv) {
							sous_niveau=1;
							break;
						}
					}
					var boite_niv3=ajouterBoite_niv3(donnees,data_niv3_label[k][i][j],data_niv3_values[k][i][j],data_niv3_id[k][i][j],data_niv3_source[k][i][j],data_niv3_source_lien[k][i][j],data_niv1_values[k],data_niv2_values[k][i],i,j,centerX,pos_niv3_Y,boite_niv2_bas_haut,nombre_boites,sous_niveau,orig,annee_liste,nombre_an,liste_jeux_donnees,numero_jeux_donnees);
				}
			}
		}
		nb_niv2_prec+=parseInt(struct_niv2[2*k+1]);
	}
	if (donnees[0][1]!='') {
		var [bas_niv1_geo_X,bas_niv1_geo_Y]=ajouterBoite_niv1_geo(donnees,data_niv1_geo_label,data_niv1_geo_id,left_box_niveau1,numero_jeux_donnees);
	
		var nombre_boites=data_niv2_geo_label.length;
		for (var i=0;i<nombre_boites;i++) {
			ajouterBoite_niv2_geo(donnees,data_niv2_geo_label[i],data_niv2_geo_id[i],i,bas_niv1_geo_X,pos_niv2_geo_Y,boite_niv2_bas_haut,nombre_boites,sous_niveau,orig,numero_jeux_donnees);
		}
	}
	
	// changement taille police
	
	for (var index_boite=0;index_boite<liste_boites_texte.length;index_boite++) {
		var boites=document.querySelectorAll('.' +liste_boites_texte[index_boite]);
		var taillePolice=15;
		boites.forEach((boite) => {
			while (taillePolice>5) {
				boite.style.fontSize = taillePolice + "px";
				if (boite.offsetWidth < boite.scrollWidth || boite.offsetHeight < boite.scrollHeight) {
					taillePolice--;
				} else {
					break;
				}
			}       
		});
		boites.forEach((boite) => {	
			boite.style.fontSize = taillePolice + 1 + "px";
			if (boite.offsetWidth < boite.scrollWidth || boite.offsetHeight < boite.scrollHeight) {
				boite.style.fontSize = taillePolice + "px";
			}
		});		
	}
	
}

function ajouterBoite_niv1_geo(csv_vecteur,data_label,data_id,left_box_niv1,numero_jeux) {

	// boîte pour label
		
    var nouvelleBoite_geog = document.createElement('div');
    nouvelleBoite_geog.classList.add('box_geog_niv1');
	nouvelleBoite_geog.style.backgroundColor = 'black'; // ou '#00FFFF'
	nouvelleBoite_geog.style.color = 'white'; // nouvelleBoite_geog.style.fontWeight = 'bold';
	

	var centerX = left_box_niv1+tableau_width['box_niv1_value']+2*tableau_width['box_niv1_label']+0.5*tableau_width['box_geog_niv1'];
	var centerY = pos_niv1_geo_Y ;
	var pos = { x:centerX, y:centerY };

    nouvelleBoite_geog.style.top = pos.y + 'px' ;  // position verticale
    nouvelleBoite_geog.style.left = pos.x -0.5*tableau_width['box_geog_niv1'] + 'px'; // position horizontale
	
	nouvelleBoite_geog.style.fontFamily = 'Verdana';
    nouvelleBoite_geog.style.textAlign = 'Center'; // ne semble pas marcher si mis en css
    nouvelleBoite_geog.style.fontSize = '1px';
	nouvelleBoite_geog.dataset.valeur=data_id;		// également pour label (en plus de lien), pour les cas où il n'y a pas de lien (niveau 1)

	var texte_geog = document.createTextNode(data_label);
    nouvelleBoite_geog.appendChild(texte_geog); // afficher la valeur géographique
    document.body.appendChild(nouvelleBoite_geog);
			
	
	// boîte pour lien
	
	var tableau_id=data_id.split(".");
	var niv_top_geo = tableau_id.length;
	if (niv_top_geo>1 || (switch_KPI_lieu==1 && csv_vecteur[0][0].lastIndexOf("_")!=-1)) {		// si niveau geo sup ou si changement de fichier quand switch geo / data
		var nouvelleBoite = document.createElement('div');
		nouvelleBoite.classList.add('lien_niv1_geo');
		nouvelleBoite.style.left = pos.x -0.5*tableau_width['lien_niv1_geo'] +'px'; // position horizontale
		nouvelleBoite.style.top = pos.y -10 -tableau_height['lien_niv1_geo'] + 'px' ;  // position verticale
		if (niv_top_geo>1) {
			nouvelleBoite.dataset.valeur=data_id;
			var boites=[nouvelleBoite_geog,nouvelleBoite];
			for (var i=0;i<boites.length;i++) {
				boites[i].addEventListener('click', function() {
					num_jeux=numero_jeux;
					var object_select = document.querySelector('.box_select');
					valeur_select=object_select.value;
					var ligne_annees=csv_vecteur[lig_min_data];
					for (i_annees=liste_jeux_donnees[0][num_jeux];i_annees<ligne_annees.length;i_annees++) {		// ne va pas jusqu'au bout si 2 tableaux car on trouve toujours une année (devrait arrêter quand on trouve une cellule vide)
						if (ligne_annees[i_annees]==valeur_select) {
							var col_annee=i_annees;
							break;
						}
					}
					var object_data = document.querySelector('.box_niv1_label');
					var valeur_data=object_data.dataset.valeur;
					var tableau_data=valeur_data.split(".");
					var niveau_top_data = tableau_data.length;			
					var valeur_geo = nouvelleBoite.dataset.valeur;
					
					var tableau_geo=valeur_geo.split(".");
					var niveau_top_geo = tableau_geo.length;
					valeur_geo=valeur_geo.substring(0,valeur_geo.lastIndexOf("."));	// si on clique en haut d'une boîte de niveau 1, on remonte d'un cran		
					niveau_top_geo--;								// si on clique en haut d'une boîte de niveau 1, on remonte d'un cran
					orig=nouvelleBoite.dataset.valeur;		// pour suivre d'où on vient
					efface_boites();
					var [niveau_top_data, valeur_data,nb_sous_niv,sous_niv_sup4,valeur_geo,niveau_top_geo]=nb_sous_niveaux(csv_vecteur,valeur_data,valeur_geo);
					Mise_a_jour(csv_vecteur,col_annee,niveau_top_data, valeur_data,nb_sous_niv,sous_niv_sup4,orig,niveau_top_geo,valeur_geo,numero_jeux);
				});
			}
		} else if (switch_KPI_lieu==1 && csv_vecteur[0][0].lastIndexOf("_")!=-1) {		// si on est au niveau 1, on remonte au fichier supérieur						
			nouvelleBoite.dataset.valeur=csv_vecteur[0][0].substring(0,csv_vecteur[0][0].length-2);
			var boites=[nouvelleBoite_geog,nouvelleBoite];
			for (var i=0;i<boites.length;i++) {
				
				orig=csv_vecteur[0][0].substring(csv_vecteur[0][0].lastIndexOf("_")+1);
				boites[i].addEventListener('click', function() {			
					if (document.querySelector('.box_select')!=null) {
						num_jeux=numero_jeux;
						var object_select = document.querySelector('.box_select');
						valeur_select=object_select.value;
						var ligne_annees=csv_vecteur[lig_min_data];
						for (i_annees=liste_jeux_donnees[0][num_jeux];i_annees<ligne_annees.length;i_annees++) {		// ne va pas jusqu'au bout si 2 tableaux car on trouve toujours une année (devrait arrêter quand on trouve une cellule vide)
							if (ligne_annees[i_annees]==valeur_select) {
								var col_annee=i_annees;
								break;
							}
						}
					} else {
						col_annee=liste_jeux_donnees[0][0];
					}
					if (document.querySelector('.box_geog_niv1')!= null) {
						var object_geo = document.querySelector('.box_geog_niv1');
						valeur_geo=object_geo.dataset.valeur;
						var tableau_geo=valeur_geo.split(".");
						var niveau_top_geo = tableau_geo.length;			
					} else {
						valeur_geo='G0';
						niveau_top_geo=1;
					}
					var valeur = nouvelleBoite.dataset.valeur;
					orig =valeur;			// pour suivre d'où on vient			
					var tableau=valeur.split(".");
					var niveau_top = tableau.length;
					valeur=valeur.substring(0,valeur.length-2);
					
					// on remet les data à gauche et geo à droite
					
					switch_KPI_lieu=0;
					var temp=col_deb_label; col_deb_label=col_deb_geo;col_deb_geo=temp;
					var temp=valeur; valeur=valeur_geo;valeur_geo=temp;
					var temp=niveau_top; niveau_top=niveau_top_geo;niveau_top_geo=temp;
			
					var jeu_donnees=this.dataset.valeur;
					var jeu_donnees_racine=jeu_donnees.substring(0,jeu_donnees.lastIndexOf("_"));
					var jeu_donnees_niveau=jeu_donnees.substring(1+jeu_donnees.lastIndexOf("_"),jeu_donnees.length);
					for (var j=0;j<csvData.length;j++) {		// on parcourt les différents fichiers
						if (csvData[j][0][0] ==jeu_donnees_racine) {
							// identifier nombre d'années dans le fichier
							nb_an=0;
							for (var k=liste_jeux_donnees[0][0];k<csvData[j][lig_min_data].length;k++) {
								if (csvData[j][lig_min_data][k]!="") {
									nb_an++;
								} else {
									break
								}
							}
							var colonne_an=liste_jeux_donnees[0][0]+nb_an-1;
							efface_boites();
							var [niveau_top_data, jeu_donnees_niveau,nb_sous_niv,sous_niv_sup4,valeur_geo,niveau_top_geo]=nb_sous_niveaux(csvData[j],jeu_donnees_niveau,'G0');
							Mise_a_jour(csvData[j],colonne_an,niveau_top_data,jeu_donnees_niveau,nb_sous_niv,sous_niv_sup4,orig,'1','G0','0');		// on met à jour avec les données du premier jeu (sortie de fichier données)
							break
						}
					}
				});			
			}
		}
		
		document.body.appendChild(nouvelleBoite); 	
	}
	
	// boîte pour flèches switch
	
    var nouvelleBoite = document.createElement('div');
	nouvelleBoite.classList.add('switch_KPI_geog');
	nouvelleBoite.style.top = pos.y + 'px' ;  // position verticale
	nouvelleBoite.style.left = left_box_niv1+tableau_width['box_niv1_value']+tableau_width['box_niv1_label'] +'px'; // position horizontale
	nouvelleBoite.dataset.valeur=data_id;
	nouvelleBoite.addEventListener("click", function() {
		var num_jeux=numero_jeux;
		switch_KPI_lieu=Math.abs(switch_KPI_lieu-1);
		if (document.querySelector('.box_select')!=null) {
			num_jeux=numero_jeux;
			var object_select = document.querySelector('.box_select');
			valeur_select=object_select.value;
			var ligne_annees=csv_vecteur[lig_min_data];
			for (i_annees=liste_jeux_donnees[0][num_jeux];i_annees<ligne_annees.length;i_annees++) {			// ne va pas jusqu'au bout si 2 tableaux car on trouve toujours une année (devrait arrêter quand on trouve une cellule vide)
				if (ligne_annees[i_annees]==valeur_select) {
					var col_annee=i_annees;
					break;
				}
			}
		} else {
			col_annee=liste_jeux_donnees[0][0];
		}
		if (document.querySelector('.box_geog_niv1')!= null) {
			var object_geo = document.querySelector('.box_geog_niv1');
			valeur_geo=object_geo.dataset.valeur;
			var tableau_geo=valeur_geo.split(".");
			var niveau_top_geo = tableau_geo.length;			
		} else {
			valeur_geo='G0';
			niveau_top_geo=1;
		}
		var lien_niv1_object =document.querySelector('.box_niv1_label')
		var valeur=lien_niv1_object.dataset.valeur;
		var tableau_id=valeur.split(".");
		var niveau_top = tableau_id.length;

		// inversion lieux et data : changement numéros de colonnes
		
		var temp=col_deb_label; col_deb_label=col_deb_geo;col_deb_geo=temp;
		var temp=valeur; valeur=valeur_geo;valeur_geo=temp;
		var temp=niveau_top; niveau_top=niveau_top_geo;niveau_top_geo=temp;
		
		efface_boites();
		var [niveau_top, valeur,nb_sous_niv,sous_niv_sup4,valeur_geo,niveau_top_geo]=nb_sous_niveaux(csv_vecteur,valeur,valeur_geo);
		Mise_a_jour(csv_vecteur,col_annee,niveau_top, valeur,nb_sous_niv,sous_niv_sup4, orig,niveau_top_geo,valeur_geo,num_jeux);
	});
	
	
	document.body.appendChild(nouvelleBoite);
	
	
	return[centerX,centerY];
}


function ajouterBoite_niv2_geo(csv_vecteur,data_label,data_id,i,niv2_X, niv2_Y,niv2_bas_haut,nb_boites,sous_niv,ori,numero_jeux) {


	var angleStep = Math.PI / (parseInt(nb_boites*2));
	var angle = Math.PI;
	var rayon_geo=rayon_geo_min+Math.min(nb_boites,10)/10*(rayon_geo_max-rayon_geo_min)
	var pos = getPosition(angle + (2*i+1) * angleStep, rayon_geo, niv2_X, niv2_Y);
	
	// boîte pour label
	
    var nouvelleBoite_label = document.createElement('div');
	nouvelleBoite_label.style.backgroundColor = '#D9D9D9';
	nouvelleBoite_label.style.color = 'black';
	

	nouvelleBoite_label.classList.add('box_geog_niv2');
	nouvelleBoite_label.style.top = pos.y +'px' ;  // position verticale
	nouvelleBoite_label.style.left = pos.x - 0.5*tableau_width['box_geog_niv2'] + 'px'; // position horizontale
	nouvelleBoite_label.style.fontFamily = 'Verdana';
	nouvelleBoite_label.style.textAlign = 'Center'; // ne semble pas marcher si mis en css
	nouvelleBoite_label.style.fontSize = '1px';
    
	var texte_niv2_geo_label = document.createTextNode(data_label);
	var span_niv2_geo_label = document.createElement('span'); 
	span_niv2_geo_label.classList.add('couleur_label'); 
	span_niv2_geo_label.appendChild(texte_niv2_geo_label); 

	nouvelleBoite_label.appendChild(span_niv2_geo_label);

    document.body.appendChild(nouvelleBoite_label);

	
	// boîte pour lien

    var nouvelleBoite = document.createElement('div');
	nouvelleBoite.classList.add('lien_niv2_geo');
	nouvelleBoite.style.top = pos.y -15 + 'px' ;  // position verticale
	nouvelleBoite.style.left = pos.x  -0.5*tableau_width['lien_niv2_geo'] +'px'; // position horizontale  
	nouvelleBoite.dataset.valeur=data_id;
	var boites=[nouvelleBoite_label,nouvelleBoite];
	for (var i=0;i<boites.length;i++) {
		boites[i].addEventListener('click', function() {
			
			var num_jeux=numero_jeux;
			var object_select = document.querySelector('.box_select');
			valeur_select=object_select.value;
			var ligne_annees=csv_vecteur[lig_min_data];
			for (i_annees=liste_jeux_donnees[0][num_jeux];i_annees<ligne_annees.length;i_annees++) {			// ne va pas jusqu'au bout si 2 tableaux car on trouve toujours une année (devrait arrêter quand on trouve une cellule vide)
				if (ligne_annees[i_annees]==valeur_select) {
					var col_annee=i_annees;
					break;
				}
			}
			var object_data = document.querySelector('.box_niv1_label');
			var valeur_data=object_data.dataset.valeur;
			var tableau_data=valeur_data.split(".");
			var niveau_top_data = tableau_data.length;

			if (document.querySelector('.box_geog_niv1')!=null) {
				var object_geo = document.querySelector('.box_geog_niv1');
				valeur_geo=nouvelleBoite.dataset.valeur;
				var tableau_geo=valeur_geo.split(".");
				var niveau_top_geo = tableau_geo.length;
			} else {
				valeur_geo='G0';
				niveau_top_geo=1;
			}
			orig=valeur_geo;
			efface_boites();
			var [niveau_top_data, valeur_data,nb_sous_niv,sous_niv_sup4,valeur_geo,niveau_top_geo]=nb_sous_niveaux(csv_vecteur,valeur_data,valeur_geo);
			Mise_a_jour(csv_vecteur,col_annee,niveau_top_data, valeur_data,nb_sous_niv,sous_niv_sup4,orig,niveau_top_geo,valeur_geo,num_jeux);
		});
	}
	
	document.body.appendChild(nouvelleBoite);
}




function ajouterBoite_niv1(csv_vecteur,i, data_label, data_values,txt_data,txt_id,data_source,data_source_lien,struct_niv2,struct_niv3,nb_ss_niv,ss_niv_sup4,ori,col_annee,nb_an,liste_jeux,numero_jeux) {
		
	
	var centerX_niv2=[];
	var rayon_niv3=[];
	if (nb_ss_niv==2 && ss_niv_sup4==0) {	// si ces 2 conditions : niveau 3 à représenter
		rayon_niv3[0]=rayon_niv3_min+Math.min(Math.min(struct_niv3[1],10),10)/10*(rayon_niv3_max-rayon_niv3_min);
		centerX_niv2[0]=marge_bord+rayon_niv3[0];
		for (var j1=1;j1<struct_niv2[1+2*i];j1++) {
			rayon_niv3[j1]=rayon_niv3_min+Math.min(Math.min(struct_niv3[1+2*j1],10),10)/10*(rayon_niv3_max-rayon_niv3_min);
			centerX_niv2[j1]=centerX_niv2[j1-1]+2*marge_bord+rayon_niv3[j1-1]+rayon_niv3[j1];
		}
		if (parseInt(struct_niv2[1+2*i]) % 2===0) {	// si nombre de pair de boîtes de niveau 2, on se place au milieu
			centerX=0.5*(centerX_niv2[0]+centerX_niv2[struct_niv2[1+2*i]-1]);
		} else {		// si nombre impair de boîtes de niveau 2, on se place au niveau de la boîte de niveau 2 du milieu
			centerX=centerX_niv2[0.5*(struct_niv2[1+2*i]-1)];
		}
	} else {
		if (csv_vecteur[0][2]=='Accueil') {
			var centerX=0.5*(marge_bord+(marge_bord+tableau_width['box_niv2_value'])*struct_niv2[1+2*i]);
			for (var j1=0;j1<struct_niv2[1+2*i];j1++) {
				centerX_niv2[j1]=j1*(marge_bord+tableau_width['box_niv2_value']);
			}
		} else {
			var rayon_niv2=rayon_niv2_min+Math.min(parseInt(struct_niv2[1+2*i]),10)/10*(rayon_niv2_max-rayon_niv2_min);
			var centerX=marge_bord+rayon_niv2+tableau_width['box_niv1_label'];
		}
	}
	if (csv_vecteur[0][2]!=='Accueil' && centerX<pos_select_X+2*(tableau_width['box_select'])+0.5*(tableau_width['box_niv1_value'])) {		// box_select trop à gauche
		
		for (var j1=0;j1<centerX_niv2.length;j1++) {
			centerX_niv2[j1]=(pos_select_X+2*(tableau_width['box_select'])+0.5*(tableau_width['box_niv1_value']))/centerX*centerX_niv2[j1];		// on décale les centres de niveau 2 par homothétie
		}
		centerX=pos_select_X+2*(tableau_width['box_select'])+0.5*(tableau_width['box_niv1_value']);
	}

	var centerY = pos_niv1_Y ;
	var pos = { x:centerX, y:centerY };
	var left_box_niv1=pos.x-0.5*(tableau_width['box_niv1_value']);
	
	// boîte pour label

    var nouvelleBoite_label = document.createElement('div');
    nouvelleBoite_label.style.fontFamily = 'Arial';
    nouvelleBoite_label.style.textAlign = 'Center'; // ne semble pas marcher si mis en css
    nouvelleBoite_label.style.fontSize = '1px';
	if (data_values[liste_jeux_donnees[0][0]-1]=="C") {		// si la valeur a été calculée, on met le texte en italique
		nouvelleBoite_label.style.fontStyle = 'italic';
	}
	
	var texte_niv1_label = document.createTextNode(data_label);
	nouvelleBoite_label.appendChild(texte_niv1_label);
	if (ori=='debut' || ori==txt_id) {
		nouvelleBoite_label.style.backgroundColor = '#E2EFDA';
	}
	if (csv_vecteur[0][2]=="Structure" || csv_vecteur[0][2]=="Accueil") {	// page structure
		nouvelleBoite_label.classList.add('struct_niv1');
		nouvelleBoite_label.style.top = pos.y -0.5*(tableau_height['struct_niv1'])-tableau_border['struct_niv1']+ 'px' ;  // position verticale
		nouvelleBoite_label.style.left = pos.x -0.5*(tableau_width['struct_niv1']) + 'px'; // position horizontale  			
	} else if (txt_data==" ") {	// ventilation : ovale
		nouvelleBoite_label.classList.add('ovale_niv1');
		nouvelleBoite_label.style.top = pos.y -0.5*(tableau_height['ovale_niv1'])-tableau_border['ovale_niv1']+ 'px' ;  // position verticale
		nouvelleBoite_label.style.left = pos.x -0.5*(tableau_width['ovale_niv1']) + 'px'; // position horizontale    	
	} else {
		nouvelleBoite_label.classList.add('box_niv1_label');
		nouvelleBoite_label.style.top = pos.y -0.5*(tableau_height['box_niv1_label']+tableau_height['box_niv1_value'])-tableau_border['box_niv1_value']+ 'px' ;  // position verticale
		nouvelleBoite_label.style.left = pos.x -0.5*(tableau_width['box_niv1_label']) + 'px'; // position horizontale    
		nouvelleBoite_label.dataset.valeur=txt_id;		// également pour label (en plus de lien), pour les cas où il n'y a pas de lien (niveau 1)
	}
	
	var boite_niv1=nouvelleBoite_label;

	// boîte pour value

	if (txt_data!=" ") {	// (si ce n'est pas une ventilation)
		var nouvelleBoite_value = document.createElement('div');
		nouvelleBoite_value.style.top = pos.y+0.5*(tableau_height['box_niv1_label'] - tableau_height['box_niv1_value'])+ 'px' ;  // position verticale
		nouvelleBoite_value.style.left = pos.x-0.5*(tableau_width['box_niv1_value']) + 'px'; // position horizontale
		if (ori=='debut' || ori=='lien_niv3') {
			nouvelleBoite_value.style.backgroundColor = '#E2EFDA';
		}
		nouvelleBoite_value.style.fontFamily = 'Arial';
		nouvelleBoite_value.style.textAlign = 'Center'; // ne semble pas marcher si mis en css
		nouvelleBoite_value.style.fontSize = '1px';
		if (data_values[liste_jeux_donnees[0][0]-1]=="C") {		// si la valeur a été calculée, on met le texte en italique
			nouvelleBoite_value.style.fontStyle = 'italic';
		}
		
		if (liste_jeux_donnees[0].length==1) {	// si un seul jeu de données, une seule boîte pour valeur et unité	
			nouvelleBoite_value.classList.add('box_niv1_value');
			var texte_niv1_value = document.createTextNode(txt_data + ' ' + liste_jeux[1][0]);		
		} else {				// si plusieurs jeux de données, on sépare la valeur de l'unité et on met une liste déroulante
			nouvelleBoite_value.classList.add('box_niv1_value_seul');
			var texte_niv1_value = document.createTextNode(txt_data);
			var nouvelleBoite_unite = document.createElement('div');
			top_box_select = pos.y+0.5*(tableau_height['box_niv1_label'] - tableau_height['box_niv1_value'])+ 'px' ;  // position verticale
			left_box_select = pos.x-0.5*(tableau_width['box_niv1_value']) + tableau_width['box_niv1_value_seul'] + 'px'; // position horizontale
			var unite=csv_vecteur[lig_min_data-1][liste_jeux_donnees[0][numero_jeux]];
			var liste_unites=[];
			for (var col=liste_jeux_donnees[0][0];col<=csv_vecteur[lig_min_data-1].length-1;col++) {
				var unite_existe=0;
				for (var i=0;i<liste_unites.length;i++) {
					if (liste_unites[i]==csv_vecteur[lig_min_data-1][col]) {
						unite_existe=1;
						break
					}
				}
				if (unite_existe==0 && csv_vecteur[lig_min_data-1][col]!='') {
					liste_unites.push(csv_vecteur[lig_min_data-1][col]);
				}
			}
			if (liste_unites.length==1) {
				creation_liste_der(csv_vecteur,unite,left_box_select,top_box_select,liste_unites,'box_niv1_unite',liste_der_unites);
			} else {
				creation_liste_der(csv_vecteur,unite,left_box_select,top_box_select,liste_unites,'box_niv1_unite',liste_der_unites_choix);
			}
			
		}
		
		nouvelleBoite_value.appendChild(texte_niv1_value);
		var boite_niv1=nouvelleBoite_value;
	}

	if (txt_data!=" ") {	// (si ce n'est pas une ventilation)
		var boites=[nouvelleBoite_label,nouvelleBoite_value];
	} else {
		var boites=[nouvelleBoite_label];
	}	
	if (csv_vecteur[0][2]!="Structure" && csv_vecteur[0][2]!="Accueil") {	// page avec données
		for (var i_boites=0;i_boites<boites.length;i_boites++) {
			boites[i_boites].addEventListener('click', function() {		
				var src=data_source;
				var src_lien=data_source_lien;
				var data_lab=data_label;
				var unite_N=csv_vecteur[lig_min_data-1][col_annee];
				var annee_N=csv_vecteur[lig_min_data][col_annee];
				var value_N=data_values[col_annee];
				var num_jeux=numero_jeux;
				var abscisse=csv_vecteur[lig_min_data].slice(liste_jeux_donnees[0][num_jeux], liste_jeux_donnees[0][num_jeux]+nb_an);
				var ordonnee=[];
				for (var i=liste_jeux_donnees[0][num_jeux];i<liste_jeux_donnees[0][num_jeux]+nb_an;i++) {
					ordonnee.push(parseFloat(data_values[i].replace(',', '.').replace(' ', '')));
				}
				if (col_annee-1>liste_jeux_donnees[0][num_jeux]) {
					var annee_Nmoins1=csv_vecteur[lig_min_data][col_annee-1];
					var value_Nmoins1=data_values[col_annee-1];
				} else {
					var annee_Nmoins1=' ';
					var value_Nmoins1=' ';
				}
				if (col_annee-5>liste_jeux_donnees[0][num_jeux]-1) {
					var annee_Nmoins5=csv_vecteur[lig_min_data][col_annee-5];
					var value_Nmoins5=data_values[col_annee-5];
				} else {
					var annee_Nmoins5=' ';
					var value_Nmoins5=' ';
				}
				var pos_pop={x:pos.x +0.5*(tableau_width['box_niv1_value'])+2*tableau_border['box_niv1_value']+ 'px',y:pos.y -tableau_border['box_niv1_value'] +'px'}
				afficherPopup(nouvelleBoite_label,pos_pop,src, src_lien, annee_N,annee_Nmoins1,annee_Nmoins5,unite_N,value_N,value_Nmoins1,value_Nmoins5,abscisse,ordonnee,data_lab);
			});
		}
	}
	
    document.body.appendChild(nouvelleBoite_label);
	if (txt_data!=" ") {	// (si ce n'est pas une ventilation)
		document.body.appendChild(nouvelleBoite_value);
	}	
	
	// boîte pour lien

	var tableau_id=txt_id.split(".");
	var niv_top = tableau_id.length;

	
		
	if  (niv_top>1 || (switch_KPI_lieu==0 && csv_vecteur[0][0].lastIndexOf("_")!=-1)) {					// un niveau au-dessus dans le fichier ou un fichier supérieur : on fait un lien vers le haut
		
		var nouvelleBoite_lien = document.createElement('div');
		if  (niv_top>1) {					// on remonte dans les niveaux supérieurs en restant dans le fichier
			nouvelleBoite_lien.classList.add('lien_niv1');
			nouvelleBoite_lien.dataset.valeur=txt_id;
			nouvelleBoite_lien.style.left = pos.x -0.5*tableau_width['lien_niv1']+'px'; // position horizontale
			if (csv_vecteur[0][2]=="Structure" || txt_data==" ") {	// page structure ou ventilation
				nouvelleBoite_lien.style.top = pos.y -0.5*(tableau_height['struct_niv1'])-tableau_border['struct_niv1'] - 4 -tableau_height['lien_niv1'] + 'px' ;  // position verticale
				var boites=[nouvelleBoite_label,nouvelleBoite_lien];
			} else {
				nouvelleBoite_lien.style.top = pos.y -0.5*(tableau_height['box_niv1_label']+tableau_height['box_niv1_value'])-tableau_border['box_niv1_value'] - 4 -tableau_height['lien_niv1'] + 'px' ;  // position verticale
				var boites=[nouvelleBoite_lien];
			}
			for (var i=0;i<boites.length;i++) {
				boites[i].addEventListener('click', function() {
					var num_jeux=numero_jeux;
					if (document.querySelector('.box_select')!=null) {
						var object_select = document.querySelector('.box_select');
						valeur_select=object_select.value;
						var ligne_annees=csv_vecteur[lig_min_data];
						for (i_annees=liste_jeux_donnees[0][num_jeux];i_annees<ligne_annees.length;i_annees++) {	// ne va pas jusqu'au bout si 2 tableaux car on trouve toujours une année (devrait arrêter quand on trouve une cellule vide)
							if (ligne_annees[i_annees]==valeur_select) {
								var col_annee=i_annees;
								break;
							}
						}
					} else {
						col_annee=liste_jeux_donnees[0][num_jeux];
					}
					if (document.querySelector('.box_geog_niv1')!= null) {
						var object_geo = document.querySelector('.box_geog_niv1');
						valeur_geo=object_geo.dataset.valeur;
						var tableau_geo=valeur_geo.split(".");
						var niveau_top_geo = tableau_geo.length;			
					} else {
						valeur_geo='G0';
						niveau_top_geo=1;
					}
					var valeur = nouvelleBoite_lien.dataset.valeur;
					orig =valeur;			// pour suivre d'où on vient			
					var tableau=valeur.split(".");
					var niveau_top = tableau.length;
					valeur=valeur.substring(0,valeur.length-2);	// si on clique en haut d'une boîte de niveau 1, on remonte d'un cran		
					niveau_top--;								// si on clique en haut d'une boîte de niveau 1, on remonte d'un cran		
					efface_boites();
					var [niveau_top, valeur,nb_sous_niv,sous_niv_sup4,valeur_geo,niveau_top_geo]=nb_sous_niveaux(csv_vecteur,valeur,valeur_geo);
					Mise_a_jour(csv_vecteur,col_annee,niveau_top, valeur,nb_sous_niv,sous_niv_sup4, orig,niveau_top_geo,valeur_geo,num_jeux);
				});
			}
			
		} else if (csv_vecteur[0][0].lastIndexOf("_")!=-1) {							// si on est au niveau 1, on remonte au fichier supérieur
			nouvelleBoite_lien.classList.add('lien_niv1_accueil');
			nouvelleBoite_lien.dataset.valeur=csv_vecteur[0][0].substring(0,csv_vecteur[0][0].length-2);
			nouvelleBoite_lien.style.left = pos.x -0.5*tableau_width['lien_niv1_accueil']+'px'; // position horizontale
			
			orig=csv_vecteur[0][0].substring(csv_vecteur[0][0].lastIndexOf("_")+1);
			if (csv_vecteur[0][2]=="Structure") {	// page structure
				nouvelleBoite_lien.style.top = pos.y -0.5*(tableau_height['struct_niv1'])-tableau_border['box_niv1_value'] - 4 -tableau_height['lien_niv1_accueil'] + 'px' ;  // position verticale
				var boites=[nouvelleBoite_label,nouvelleBoite_lien];
			} else {
				nouvelleBoite_lien.style.top = pos.y -0.5*(tableau_height['box_niv1_label']+tableau_height['box_niv1_value'])-tableau_border['box_niv1_value'] - 4 -tableau_height['lien_niv1_accueil'] + 'px' ;  // position verticale
				var boites=[nouvelleBoite_lien];
			}
			for (var i=0;i<boites.length;i++) {
				boites[i].addEventListener('click', function() {
					var num_jeux=0;		// on va sortir du fichier de données, donc on réinitialise num_jeux
					var jeu_donnees=nouvelleBoite_lien.dataset.valeur;
					var jeu_donnees_racine=jeu_donnees.substring(0,jeu_donnees.lastIndexOf("_"));
					var jeu_donnees_niveau=jeu_donnees.substring(1+jeu_donnees.lastIndexOf("_"),jeu_donnees.length);
					for (var j=0;j<csvData.length;j++) {		// on parcourt les différents fichiers
						if (csvData[j][0][0] ==jeu_donnees_racine) {
							// identifier nombre d'années dans le fichier
							nb_an=0;
							for (var k=liste_jeux_donnees[0][0];k<csvData[j][lig_min_data].length;k++) {
								if (csvData[j][lig_min_data][k]!="") {
									nb_an++;
								} else {
									break
								}
							}				
							var colonne_an=liste_jeux_donnees[0][0]+nb_an-1;
							efface_boites();
							var [niveau_top_data, jeu_donnees_niveau,nb_sous_niv,sous_niv_sup4,valeur_geo,niveau_top_geo]=nb_sous_niveaux(csvData[j],jeu_donnees_niveau,'G0');
							Mise_a_jour(csvData[j],colonne_an,niveau_top_data,jeu_donnees_niveau,nb_sous_niv,sous_niv_sup4,orig,'1','G0',num_jeux);
							break
						}
					}
				});
			}
		}
		document.body.appendChild(nouvelleBoite_lien);
	}
	return[boite_niv1,centerX,centerX_niv2,left_box_niv1];
}



function ajouterBoite_niv2(csv_vecteur,data_label,data_values,txt_v,txt_id,data_source,data_source_lien,nb_ss_nv,ss_nv_sup4,plc_X,plc_Y,ori,col_annee,nb_an,liste_jeux,numero_jeux) {


    var nouvelleBoite_label = document.createElement('div');
	nouvelleBoite_label.style.fontFamily = 'Arial';
	nouvelleBoite_label.style.textAlign = 'Center'; // ne semble pas marcher si mis en css
	nouvelleBoite_label.style.fontSize = '1px';
	if (data_values[liste_jeux_donnees[0][0]-1]=="C") {		// si la valeur a été calculée, on met le texte en italique
		nouvelleBoite_label.style.fontStyle = 'italic';
	}

	var pos = { x:plc_X, y:plc_Y };

	var texte_niv2_label = document.createTextNode(data_label);
    nouvelleBoite_label.appendChild(texte_niv2_label);
	nouvelleBoite_label.dataset.valeur=txt_id;
	if (ori==txt_id) {
		nouvelleBoite_label.style.backgroundColor = '#E2EFDA';
	}
	if (csv_vecteur[0][2]=="Structure" || csv_vecteur[0][2]=="Accueil") {	// page structure
		nouvelleBoite_label.classList.add('struct_niv2');
		nouvelleBoite_label.style.top = pos.y -0.5*(tableau_height['struct_niv2'])-tableau_border['struct_niv2']+ 'px' ;  // position verticale
		nouvelleBoite_label.style.left = pos.x -0.5*(tableau_width['struct_niv2']) + 'px'; // position horizontale   	
	} else if (txt_v==" ") {	// ventilation : ovale
		nouvelleBoite_label.classList.add('ovale_niv2');
		nouvelleBoite_label.style.top = pos.y -0.5*(tableau_height['ovale_niv2'])-tableau_border['ovale_niv2']+ 'px' ;  // position verticale
		nouvelleBoite_label.style.left = pos.x -0.5*(tableau_width['ovale_niv2']) + 'px'; // position horizontale    	
	} else {			// données : rectangle
		nouvelleBoite_label.classList.add('box_niv2_label');
		nouvelleBoite_label.style.top = pos.y -0.5*(tableau_height['box_niv2_label']+tableau_height['box_niv2_value'])-tableau_border['box_niv2_value']+ 'px' ;  // position verticale
		nouvelleBoite_label.style.left = pos.x -0.5*(tableau_width['box_niv2_label']) + 'px'; // position horizontale    
	}
	



	// boîte pour value 

	if (txt_v!=" ") {	// (si ce n'est pas une ventilation)
		var nouvelleBoite_value = document.createElement('div');
		nouvelleBoite_value.classList.add('box_niv2_value');
		nouvelleBoite_value.style.top = pos.y +0.5*(tableau_height['box_niv2_label'] - tableau_height['box_niv2_value'])+ 'px' ;  // position verticale
		nouvelleBoite_value.style.left = pos.x -0.5*(tableau_width['box_niv2_value'])+ 'px'; // position horizontale    
		nouvelleBoite_value.style.fontFamily = 'Arial';
		nouvelleBoite_value.style.textAlign = 'Center'; // ne semble pas marcher si mis en css
		nouvelleBoite_value.style.fontSize = '1px';
		if (data_values[liste_jeux_donnees[0][0]-1]=="C") {		// si la valeur a été calculée, on met le texte en italique
			nouvelleBoite_value.style.fontStyle = 'italic';
		}		
		if (ori==txt_id) {
			nouvelleBoite_value.style.backgroundColor = '#E2EFDA';
		}
		
		var texte_niv2_value = document.createTextNode('\n'+ txt_v);
		var span_niv2_value = document.createElement('span'); 
		span_niv2_value.classList.add('couleur_value'); 
		span_niv2_value.appendChild(texte_niv2_value);	

		nouvelleBoite_value.appendChild(span_niv2_value);
	}


	if (txt_v!=" ") {	// (si ce n'est pas une ventilation)
		var boites=[nouvelleBoite_label,nouvelleBoite_value];
	// } else {
		// var boites=[nouvelleBoite_label];
	}	
	if (csv_vecteur[0][2]!="Structure" && csv_vecteur[0][2]!="Accueil" && txt_v!==" ") {	// page avec données
		for (var i_boites=0;i_boites<boites.length;i_boites++) {
			boites[i_boites].addEventListener('click', function() {		
				var src=data_source;
				var src_lien=data_source_lien;
				var data_lab=data_label;
				var unite_N=csv_vecteur[lig_min_data-1][col_annee];
				var annee_N=csv_vecteur[lig_min_data][col_annee];
				var value_N=data_values[col_annee];
				var num_jeux=numero_jeux;
				var abscisse=csv_vecteur[lig_min_data].slice(liste_jeux_donnees[0][num_jeux], liste_jeux_donnees[0][num_jeux]+nb_an);
				var ordonnee=[];
				for (var i_annees=liste_jeux_donnees[0][num_jeux];i_annees<liste_jeux_donnees[0][num_jeux]+nb_an;i_annees++) {
					ordonnee.push(parseFloat(data_values[i_annees].replace(',', '.').replace(' ', '')));
				}
				if (col_annee-1>liste_jeux_donnees[0][0]-1) {
					var annee_Nmoins1=csv_vecteur[lig_min_data][col_annee-1];
					var value_Nmoins1=data_values[col_annee-1];
				} else {
					var annee_Nmoins1=' ';
					var value_Nmoins1=' ';
				}
				if (col_annee-5>liste_jeux_donnees[0][0]-1) {
					var annee_Nmoins5=csv_vecteur[lig_min_data][col_annee-5];
					var value_Nmoins5=data_values[col_annee-5];
				} else {
					var annee_Nmoins5=' ';
					var value_Nmoins5=' ';
				}
				var pos_pop={x:pos.x +0.5*(tableau_width['box_niv2_value'])+2*tableau_border['box_niv2_value']+ 'px',y:pos.y -tableau_border['box_niv2_value'] +'px'}
				afficherPopup(nouvelleBoite_label,pos_pop,src, src_lien, annee_N,annee_Nmoins1,annee_Nmoins5,unite_N,value_N,value_Nmoins1,value_Nmoins5,abscisse,ordonnee,data_lab);
			});
		}
	}
	
    document.body.appendChild(nouvelleBoite_label);
	if (txt_v!=" ") {	// (si ce n'est pas une ventilation)
		document.body.appendChild(nouvelleBoite_value);
		niv2_bas_X=nouvelleBoite_value.offsetLeft + nouvelleBoite_value.offsetWidth/2;
		niv2_bas_Y=nouvelleBoite_value.offsetTop + nouvelleBoite_value.offsetHeight;		
	}	else {
		niv2_bas_X=nouvelleBoite_label.offsetLeft + nouvelleBoite_label.offsetWidth/2;
		niv2_bas_Y=nouvelleBoite_label.offsetTop + nouvelleBoite_label.offsetHeight;
	}
	
	niv2_haut_X=nouvelleBoite_label.offsetLeft + nouvelleBoite_label.offsetWidth/2;
	niv2_haut_Y=nouvelleBoite_label.offsetTop;	
	
	var boite_niv2=[niv2_haut_X,niv2_haut_Y,niv2_bas_X,niv2_bas_Y];
	

	// boîte pour texte déroulant (page d'accueil)

	if (csv_vecteur[0][2]=='Accueil') {
		var nouvelleBoite_titre_der = document.createElement('div');
		
		nouvelleBoite_titre_der.classList.add('box_texte_der');
		nouvelleBoite_titre_der.style.top = pos.y +0.5*(tableau_height['box_niv2_label'] + tableau_height['box_niv2_value'])+ 0.5*tableau_height['box_niv2_value']+ 'px' ;  // position verticale
		nouvelleBoite_titre_der.style.left = pos.x -0.5*(tableau_width['box_niv2_value']) +'px'; // position horizontale
		
		var texte_der_niv2_titre = document.createElement('p');
		texte_der_niv2_titre.style.textAlign = 'center';
		texte_der_niv2_titre.innerHTML = 'Exemples'+ '<br>';
		nouvelleBoite_titre_der.appendChild(texte_der_niv2_titre);

		var nouvelleBoite_der = document.createElement('div');
		nouvelleBoite_der.classList.add('box_texte_der');
		nouvelleBoite_der.style.top = pos.y +0.5*tableau_height['box_niv2_label'] + tableau_height['box_niv2_value']+0.5*tableau_height['box_texte_der']+ 'px' ;  // position verticale
		nouvelleBoite_der.style.left = pos.x -0.5*(tableau_width['box_niv2_value']) +'px'; // position horizontale
		var texte_der_niv2 = document.createElement('p');
		texte_der_niv2.style.textAlign = 'right';
		texte_der_niv2.style.animation = "defilement 10s linear infinite";
		texte_der_niv2.style.whiteSpace = 'nowrap';
		if (data_label=="L'Etre humain") {
			texte_der_niv2.innerHTML = '    Emploi, population, santé, éducation...'+ '<br>'; // quid sondages ? Rajouter politique ?
		} else if (data_label=="Son environnement") {
			texte_der_niv2.innerHTML = '    Gaz à effet de serre, mètres carrés, nombre de voitures, de trains, de déplacements...' + '<br>';
		} else if (data_label=="Son économie") {
			texte_der_niv2.innerHTML = '    PIB, dette, déficit, balance commerciale, budget, dépenses...'+ '<br>';
		}

		nouvelleBoite_der.appendChild(texte_der_niv2);
		
		document.body.appendChild(nouvelleBoite_titre_der);
		document.body.appendChild(nouvelleBoite_der);	
	}
	
	// boîte pour lien
	
	
	var donnee_id=csv_vecteur[0][0] + "_" + txt_id;
	var existe_sous_fichier=0;
	for (var i=0;i<csvData.length;i++) {
		if (csvData[i][0][0] ==donnee_id) {
			existe_sous_fichier=1;
			break
		}
	}
	if (existe_sous_fichier==1) {		// si on a un sous-fichier, on met un lien externe
		var nouvelleBoite_lien = document.createElement('div');
		nouvelleBoite_lien.classList.add('lien_niv2_accueil');
		nouvelleBoite_lien.dataset.valeur=donnee_id;
		nouvelleBoite_lien.style.left = pos.x -0.5*tableau_width['lien_niv2_accueil']+'px'; // position horizontale
		if (csv_vecteur[0][2]=='Accueil') {
			nouvelleBoite_lien.style.top = pos.y +0.5*tableau_height['box_niv2_label'] + tableau_height['box_niv2_value']+tableau_height['box_texte_der']+ 30 + 'px' ;  // position verticale
			var boites=[nouvelleBoite_label,nouvelleBoite_der,nouvelleBoite_titre_der,nouvelleBoite_lien];	
		} else {
			nouvelleBoite_lien.style.top = pos.y +0.5*tableau_height['struct_niv2'] + 0.5*tableau_height['lien_niv2_accueil']+ 'px' ;  // position verticale
			var boites=[nouvelleBoite_label,nouvelleBoite_lien];
		}
		for (var i=0;i<boites.length;i++) {
			boites[i].addEventListener('click', function() {
				var num_jeux=numero_jeux;					
				var jeu_donnees=nouvelleBoite_lien.dataset.valeur;
				orig="V0";						
				for (var j=0;j<csvData.length;j++) {		// on parcourt les différents fichiers			
					if (csvData[j][0][0] ==jeu_donnees) {
						// identifier nombre d'années dans le fichier
						nb_an=0;
						for (var k=liste_jeux_donnees[0][0];k<csvData[j][lig_min_data].length;k++) {
							if (csvData[j][lig_min_data][k]!="") {
								nb_an++;
							} else {
								break
							}
						}					
						var colonne_an=liste_jeux_donnees[0][0]+nb_an-1;
						efface_boites();
						var [niveau_top_data, jeu_donnees_niveau,nb_sous_niv,sous_niv_sup4,valeur_geo,niveau_top_geo]=nb_sous_niveaux(csvData[j],"V0",'G0');
						Mise_a_jour(csvData[j],colonne_an,'1',"V0",nb_sous_niv,sous_niv_sup4,orig,'1','G0',num_jeux);
						break					
					}
				}
			});
		}
		document.body.appendChild(nouvelleBoite_lien);
	} else {		// si on n'a pas mis de lien vers un niveau 3 (lien "interne" au fichier csv)
		var lien_niv2=0;
		if (nb_ss_nv==1 || (nb_ss_nv==2 && ss_nv_sup4==1)) {		// pas de sous-fichier et pas de niveau 3 représenté : on va mettre un lien
			var nouvelleBoite_lien = document.createElement('div');
			nouvelleBoite_lien.style.top = pos.y +0.5*(tableau_height['box_niv2_label'] + tableau_height['box_niv2_value'])+ 0.5*tableau_height['box_niv2_value']+ 'px' ;  // position verticale
			nouvelleBoite_lien.style.left = pos.x - 4 +'px'; // position horizontale
			nouvelleBoite_lien.dataset.valeur=txt_id;
			
			if (nb_ss_nv==2 && ss_nv_sup4==1) {		// plus de 4 boîtes de niveau 2 et niveaux 3 existent (pas forcément partout) : chercher si niveau 3 pour mettre un lien
				for (var row=lig_min_data+1;row<csv_vecteur.length-1;row++) {
					if (csv_vecteur[row][col_deb_label+txt_id.length+1]==txt_id + '.1') {  // attention : pas de niveau +1 sous toutes les boîtes
						nouvelleBoite_lien.classList.add('lien_niv3');
						lien_niv2=1;
						break;
					}
				}
			}
			if (nb_ss_nv==1 || (nb_ss_nv==2 && ss_nv_sup4==1 && lien_niv2==0)) {		// si pas de données en-dessous on met un lien carré (pour pouvoir afficher la donnée de niveau 3 en haut, pour pouvoir switcher avec la géographie
				nouvelleBoite_lien.classList.add('lien_niv3_carre');
			}
				
			if (csv_vecteur[0][2]=="Accueil") {	// page structure
				var boites=[nouvelleBoite_label,nouvelleBoite_der,nouvelleBoite_titre_der,nouvelleBoite_lien];
			} else if (csv_vecteur[0][2]=="Structure" || txt_v==" ") {	// page structure ou si c'est une ventilation
				var boites=[nouvelleBoite_label,nouvelleBoite_lien];
			} else {
				var boites=[nouvelleBoite_lien];
			}
			for (var i=0;i<boites.length;i++) {
				boites[i].addEventListener('click', function() {
					var num_jeux=numero_jeux;
					if (document.querySelector('.box_select')!=null) {
						var object_select = document.querySelector('.box_select');
						valeur_select=object_select.value;
						var ligne_annees=csv_vecteur[lig_min_data];
						for (i_annees=liste_jeux_donnees[0][num_jeux];i_annees<ligne_annees.length;i_annees++) {	// ne va pas jusqu'au bout si 2 tableaux car on trouve toujours une année (devrait arrêter quand on trouve une cellule vide)
							if (ligne_annees[i_annees]==valeur_select) {
								var col_annee=i_annees;
								break;
							}
						}
					} else {
						col_annee=liste_jeux_donnees[0][num_jeux];
					}
					if (document.querySelector('.box_geog_niv1')!=null) {
						var object_geo = document.querySelector('.box_geog_niv1');
						valeur_geo=object_geo.dataset.valeur;
						var tableau_geo=valeur_geo.split(".");
						var niveau_top_geo = tableau_geo.length;
					} else {
						valeur_geo='G0';
						niveau_top_geo=1;
					}
					
					var valeur = nouvelleBoite_lien.dataset.valeur;
					orig=valeur;		// pour suivre d'où on vient
					var tableau=valeur.split(".");
					var niveau_top = tableau.length;
					efface_boites();
					var [niveau_top, valeur,nb_sous_niv,sous_niv_sup4,valeur_geo,niveau_top_geo]=nb_sous_niveaux(csv_vecteur,valeur,valeur_geo);
					Mise_a_jour(csv_vecteur,col_annee,niveau_top, valeur,nb_sous_niv,sous_niv_sup4,orig,niveau_top_geo,valeur_geo,num_jeux);
				});
			}
			document.body.appendChild(nouvelleBoite_lien);	
		}
	}
	

	return(boite_niv2);
}



function ajouterBoite_niv3(csv_vecteur,data_label,data_values,data_id,data_source,data_source_lien,data_values_niv1,data_values_niv2,i,j, niv2_X, niv2_Y,niv2_bas_haut,nb_boites,sous_niv,ori,col_annee,nb_an,liste_jeux,numero_jeux) {


	var angleStep = Math.PI / (parseInt(nb_boites*2));
	var angle = Math.PI;
	var rayon_niv3=rayon_niv3_min+Math.min(nb_boites,10)/10*(rayon_niv3_max-rayon_niv3_min)
	var pos = getPosition(angle + (2*j+1) * angleStep, rayon_niv3, niv2_X, niv2_Y);
	
	// boîte pour label
	
    var nouvelleBoite_label = document.createElement('div');
	nouvelleBoite_label.style.fontSize = '1px';
	nouvelleBoite_label.style.textAlign = 'Center'; // ne semble pas marcher si mis en css
	nouvelleBoite_label.style.fontFamily = 'Arial';
	if (data_values[liste_jeux_donnees[0][0]-1]=="C") {		// si la valeur a été calculée, on met le texte en italique
		nouvelleBoite_label.style.fontStyle = 'italic';
	}	

	if (csv_vecteur[0][2]=="Structure" || csv_vecteur[0][2]=="Accueil") {	// page structure
		nouvelleBoite_label.classList.add('struct_niv3');
		nouvelleBoite_label.style.top = pos.y -0.5*(tableau_height['struct_niv3'])-tableau_border['struct_niv3']+ 'px' ;  // position verticale
		nouvelleBoite_label.style.left = pos.x -0.5*(tableau_width['struct_niv3']) + 'px'; // position horizontale  	
	} else if (JSON.stringify(data_values)==JSON.stringify([])) {	// ventilation : ovale
		nouvelleBoite_label.classList.add('ovale_niv3');
		nouvelleBoite_label.style.top = pos.y -0.5*(tableau_height['ovale_niv3'])-tableau_border['ovale_niv3']+ 'px' ;  // position verticale
		nouvelleBoite_label.style.left = pos.x -0.5*(tableau_width['ovale_niv3']) + 'px'; // position horizontale    
	} else {						// données : rectangle
		nouvelleBoite_label.classList.add('box_niv3_label');
		nouvelleBoite_label.style.top = pos.y -0.5*(tableau_height['box_niv3_label']+tableau_height['box_niv3_value'])-tableau_border['box_niv3_value'] +'px' ;  // position verticale
		nouvelleBoite_label.style.left = pos.x -0.5*(tableau_width['box_niv3_value'])+ 'px'; // position horizontale    
		if (ori==data_id) {
			nouvelleBoite_label.style.backgroundColor = '#E2EFDA';
		}
	}
    
	var texte_niv3_label = document.createTextNode(data_label);
	var span_niv3_label = document.createElement('span'); 
	span_niv3_label.classList.add('couleur_label'); 
	span_niv3_label.appendChild(texte_niv3_label); 

	nouvelleBoite_label.appendChild(span_niv3_label);


	// boîte pour value
	
	if (JSON.stringify(data_values)!=JSON.stringify([])) {	// (si ce n'est pas une ventilation)
		var nouvelleBoite_value = document.createElement('div');
		nouvelleBoite_value.classList.add('box_niv3_value');

		// basculer valeurs en pourcentage
		
		var texte_values_arr_niv3=[];
		var data_type="";
		if (data_values[col_nb_ratio]=='ratio' || csv_vecteur[lig_min_data-2][col_annee]=='ratio') {
			data_type='ratio';
		}
		if (JSON.stringify(data_values_niv2)==JSON.stringify([])) {	// si niveau 2 est une ventilation, faire % vs niveau 1
			texte_values_arr_niv3.push(data_in_pourcent(data_values[col_annee],data_values_niv1[col_annee],data_type,liste_jeux));
		} else {
			texte_values_arr_niv3.push(data_in_pourcent(data_values[col_annee],data_values_niv2[col_annee],data_type,liste_jeux));
		}
		nouvelleBoite_value.style.top = pos.y +0.5*(tableau_height['box_niv3_label'] - tableau_height['box_niv3_value'])+ 'px' ;  // position verticale
		nouvelleBoite_value.style.left = pos.x -0.5*(tableau_width['box_niv3_value'])+ 'px'; // position horizontale    
		nouvelleBoite_value.style.fontFamily = 'Arial';
		nouvelleBoite_value.style.textAlign = 'Center'; // ne semble pas marcher si mis en css
		nouvelleBoite_value.style.fontSize = '1px';
		if (data_values[liste_jeux_donnees[0][0]-1]=="C") {		// si la valeur a été calculée, on met le texte en italique
			nouvelleBoite_value.style.fontStyle = 'italic';
		}		
		if (ori==data_id) {
			nouvelleBoite_value.style.backgroundColor = '#E2EFDA';
		}
		var texte_niv3_value = document.createTextNode('\n'+ texte_values_arr_niv3);
		var span_niv3_value = document.createElement('span'); 
		span_niv3_value.classList.add('couleur_value'); 
		span_niv3_value.appendChild(texte_niv3_value);	
		nouvelleBoite_value.appendChild(span_niv3_value);
	}
	if (JSON.stringify(data_values)!=JSON.stringify([])) {
		var boites=[nouvelleBoite_label,nouvelleBoite_value];
	} else {
		var boites=[nouvelleBoite_label];
	}
	if (csv_vecteur[0][2]!="Structure" && csv_vecteur[0][2]!="Accueil") {	// page avec données
		for (var i_boites=0;i_boites<boites.length;i_boites++) {
			boites[i_boites].addEventListener('click', function() {			
				var src=data_source;
				var src_lien=data_source_lien;
				var data_lab=data_label;
				var unite_N=csv_vecteur[lig_min_data-1][col_annee];
				var annee_N=csv_vecteur[lig_min_data][col_annee];
				var value_N=data_values[col_annee];
				var num_jeux=numero_jeux;
				var abscisse=csv_vecteur[lig_min_data].slice(liste_jeux_donnees[0][num_jeux], liste_jeux_donnees[0][num_jeux]+nb_an);
				var ordonnee=[];
				for (var i_annees=liste_jeux_donnees[0][num_jeux];i_annees<liste_jeux_donnees[0][num_jeux]+nb_an;i_annees++) {
					ordonnee.push(parseFloat(data_values[i_annees].replace(',', '.').replace(' ', '')));
				}
				if (col_annee-1>liste_jeux_donnees[0][0]-1) {
					var annee_Nmoins1=csv_vecteur[lig_min_data][col_annee-1];
					var value_Nmoins1=data_values[col_annee-1];
				} else {
					var annee_Nmoins1=' ';
					var value_Nmoins1=' ';
				}
				if (col_annee-5>liste_jeux_donnees[0][0]-1) {
					var annee_Nmoins5=csv_vecteur[lig_min_data][col_annee-5];
					var value_Nmoins5=data_values[col_annee-5];
				} else {
					var annee_Nmoins5=' ';
					var value_Nmoins5=' ';
				}
				var pos_pop={x:pos.x +0.5*(tableau_width['box_niv3_value'])+2*tableau_border['box_niv3_value']+ 'px',y:pos.y -tableau_border['box_niv3_value'] +'px'}
				afficherPopup(nouvelleBoite_label,pos_pop,src, src_lien, annee_N,annee_Nmoins1,annee_Nmoins5,unite_N,value_N,value_Nmoins1,value_Nmoins5,abscisse,ordonnee,data_lab);
			});
		}
	}
	
	document.body.appendChild(nouvelleBoite_label);
	
	var nouvelleBoite_haut_X=nouvelleBoite_label.offsetLeft + nouvelleBoite_label.offsetWidth/2;
	var nouvelleBoite_haut_Y=nouvelleBoite_label.offsetTop;
	var niv2_bas_X=niv2_bas_haut[2];
	var niv2_bas_Y=niv2_bas_haut[3];

	addline(niv2_bas_X[i], niv2_bas_Y[i],nouvelleBoite_haut_X,nouvelleBoite_haut_Y);	
	if (JSON.stringify(data_values)!=JSON.stringify([])) {
		document.body.appendChild(nouvelleBoite_value);
	}
	
  	var boite_niveau3=nouvelleBoite_value;

  
	// boîte pour lien

	// on cherche d'abord s'il y a un sous-fichier sur lequel renvoyer

	var donnee_id=csv_vecteur[0][0] + "_" + data_id;
	var existe_sous_fichier=0;
	for (var i=0;i<csvData.length;i++) {
		if (csvData[i][0][0] ==donnee_id) {
			existe_sous_fichier=1;
			break
		}
	}
	if (existe_sous_fichier==1) {		// si on a un sous-fichier, on met un lien externe
		var nouvelleBoite_lien = document.createElement('div');
		nouvelleBoite_lien.classList.add('lien_niv2_accueil');
		nouvelleBoite_lien.dataset.valeur=donnee_id;
		nouvelleBoite_lien.style.left = pos.x -0.5*tableau_width['lien_niv2_accueil']+'px'; // position horizontale
		if (csv_vecteur[0][2]=='Structure') {
			nouvelleBoite_lien.style.top = pos.y +0.5*tableau_height['struct_niv3'] + 0.5*tableau_height['lien_niv2_accueil']+ 'px' ;  // position verticale
			var boites=[nouvelleBoite_label,nouvelleBoite_lien];
		}
		for (var i=0;i<boites.length;i++) {
			boites[i].addEventListener('click', function() {
				var num_jeux=numero_jeux;
				var jeu_donnees=nouvelleBoite_lien.dataset.valeur;				
				for (var j=0;j<csvData.length;j++) {		// on parcourt les différents fichiers			
					if (csvData[j][0][0] ==jeu_donnees) {
						// identifier nombre d'années dans le fichier
						nb_an=0;
						for (var k=liste_jeux_donnees[0][0];k<csvData[j][lig_min_data].length;k++) {
							if (csvData[j][lig_min_data][k]!="") {
								nb_an++;
							} else {
								break
							}
						}
						var colonne_an=liste_jeux_donnees[0][0]+nb_an-1;
						efface_boites();
						var [niveau_top_data, jeu_donnees_niveau,nb_sous_niv,sous_niv_sup4,valeur_geo,niveau_top_geo]=nb_sous_niveaux(csvData[j],"V0",'G0');
						Mise_a_jour(csvData[j],colonne_an,'1',"V0",nb_sous_niv,sous_niv_sup4,orig,'1','G0',num_jeux);
						break					
					}
				}
			});
		}
		document.body.appendChild(nouvelleBoite_lien);
	} else {
		var nouvelleBoite_lien = document.createElement('div');
		
		nouvelleBoite_lien.style.top = pos.y + 0.5*(tableau_height['box_niv3_label'] + tableau_height['box_niv3_value'])+ 0.5*tableau_height['box_niv3_value']+ 'px' ;  // position verticale
		nouvelleBoite_lien.style.left = pos.x - 4 +'px'; // position horizontale   
		nouvelleBoite_lien.dataset.valeur=data_id;


		//var lien_niv3=0;
		if (sous_niv==1) {
			nouvelleBoite_lien.classList.add('lien_niv3');
		} else {
			nouvelleBoite_lien.classList.add('lien_niv3_carre');
		}
		if (JSON.stringify(data_values)==JSON.stringify([])) {	// s'il n'y a pas de données, le fait de cliquer fait descendre dans l'arbre
			var boites=[nouvelleBoite_label,nouvelleBoite_lien];
		} else {
			var boites=[nouvelleBoite_lien];
		}
		for (var i=0;i<boites.length;i++) {
			boites[i].addEventListener('click', function() {
				var num_jeux=numero_jeux;
				if (document.querySelector('.box_select')!=null) {
					var object_select = document.querySelector('.box_select');
					valeur_select=object_select.value;
					var ligne_annees=csv_vecteur[lig_min_data];
					for (i_annees=liste_jeux_donnees[0][num_jeux];i_annees<ligne_annees.length;i_annees++) {	// ne va pas jusqu'au bout si 2 tableaux car on trouve toujours une année (devrait arrêter quand on trouve une cellule vide)
						if (ligne_annees[i_annees]==valeur_select) {
							var col_annee=i_annees;
							break;
						}
					}
				} else {
					col_annee=liste_jeux_donnees[0][num_jeux];
				}
				if (document.querySelector('.box_geog_niv1')!=null) {
					var object_geo = document.querySelector('.box_geog_niv1');
					valeur_geo=object_geo.dataset.valeur;
					var tableau_geo=valeur_geo.split(".");
					var niveau_top_geo = tableau_geo.length;
				} else {
					valeur_geo='G0';
					niveau_top_geo=1;
				}
				var valeur = nouvelleBoite_lien.dataset.valeur;
				orig=valeur;		// pour suivre d'où on vient
				var tableau=valeur.split(".");
				var niveau_top = tableau.length;
				efface_boites();
				var [niveau_top, valeur,nb_sous_niv,sous_niv_sup4,valeur_geo,niveau_top_geo]=nb_sous_niveaux(csv_vecteur,valeur,valeur_geo);
				Mise_a_jour(csv_vecteur,col_annee,niveau_top, valeur,nb_sous_niv,sous_niv_sup4,orig,niveau_top_geo,valeur_geo,num_jeux);
			});		
		}
		document.body.appendChild(nouvelleBoite_lien);	
	}
	return(boite_niveau3);
}

// ajoute une ligne entre les points 1(x1, y1) et 2 (x2, y2)

function addline(x1, y1, x2, y2) {	

  	// Crée un élément de ligne HTML
	var line = document.createElement('hr');

	// Définit les propriétés de style de la ligne
	line.classList.add('box_line');
	line.style.border = 'none';
	line.style.backgroundColor = 'red';
	line.style.height = '1px';
	line.style.width = Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2)) + 'px';
	line.style.top = y1 + 'px';
	line.style.left = x1 + 'px';
	line.style.transformOrigin = '0% 0%';
	line.style.transform = 'rotate(' + Math.atan2(y2-y1, x2-x1) + 'rad)';

	// Ajoute la règle CSS pour éliminer les marges par défaut de la balise <hr>
	var styleSheet = document.styleSheets[0];
	styleSheet.insertRule('hr { margin: 0; }', styleSheet.cssRules.length);

	// Ajoute la ligne à la page
	document.body.appendChild(line);


}


function handleCSVFile(file, callback) {
  Papa.parse(file, {
	encoding: "ISO-8859-1",
    complete: function(results) {
      // Une fois le fichier CSV traité, vous pouvez accéder aux données dans results.data
		callback(results.data);	
    }
  });
}


function choix_val_csv(csv_vecteur,colonne_annee, niv_tp, val,val_geo,niv_tp_geo,liste_jeux,numero_jeux) {

	var tab_data=val.split(".");
	var niv_tp = tab_data.length;
	var nb_pts=niv_tp-1;
	
	var tab_data_geo=val_geo.split(".");
	var niv_tp_geo = tab_data_geo.length;
	var nb_pts_geo=niv_tp_geo-1;
	
	// pour les pages accueil et structure, rajouter les "V" et "G0"
	
	if (csv_vecteur[0][2]=="Structure" || csv_vecteur[0][2]=="Accueil") {	// page structure
		for (var row=lig_min_data+1;row<csv_vecteur.length-1;row++) {
			csv_vecteur[row][col_deb_geo+1]="G0";
			csv_vecteur[row][liste_jeux_donnees[0][0]-1]="V";
		}
	}
	
	// détail du contenu des 3 niveaux

	var data_niv1_label=[];
	var data_niv1_id=[];
	var data_niv1_values=[];
	var data_niv1_type=[];
	var data_niv1_source=[];
	var data_niv1_source_lien=[];
	
	var data_niv2_label=[];
	var data_niv2_id=[];
	var data_niv2_values=[];
	var data_niv2_type=[];
	var data_niv2_source=[];
	var data_niv2_source_lien=[];
	
	var data_niv3_label=[];
	var data_niv3_id=[];
	var data_niv3_values=[];
	var data_niv3_type=[];
	var data_niv3_source=[];
	var data_niv3_source_lien=[];

	var data_niv1_geo_label=[];
	var data_niv1_geo_id=[];
	
	var data_niv2_geo_label=[];
	var data_niv2_geo_id=[];

	var long_val=val.length;
	var long_val_geo=val_geo.length;
	
	var csv_vecteur_filtre=[];
	var row_filtre=0;
	var nb_data_max=Math.min(num_data_max,niv_tp+2);
	var nb_data_max_geo=Math.min(num_data_max_geo,niv_tp_geo+2);
	for (var row=lig_min_data+1;row<csv_vecteur.length-1;row++) {
		if (csv_vecteur[row][col_deb_label+1+2*nb_pts]==val && csv_vecteur[row][col_deb_geo+1+2*nb_pts_geo]==val_geo) {
			if (csv_vecteur[row][col_deb_label+1+2*nb_data_max]=="" && csv_vecteur[row][col_deb_geo+1+2*nb_data_max_geo]==""){
				csv_vecteur_filtre[row_filtre]=csv_vecteur[row];
				row_filtre++;
			}
		}
	}
	
	id_niv1=0;
	
	// RECHERCHE DES DONNEES DE NIVEAU 1
	
	for (var row=0;row<csv_vecteur_filtre.length;row++) {
		if (csv_vecteur_filtre[row][col_deb_label+1+2*(nb_pts+1)]=="" && csv_vecteur_filtre[row][col_deb_geo+1+2*(nb_pts_geo+1)]=="") {
			data_niv1_label[0]=csv_vecteur_filtre[row][col_deb_label+2*nb_pts];
			data_niv1_id[0]=csv_vecteur_filtre[row][col_deb_label+1+2*nb_pts];
			data_niv1_type[0]=csv_vecteur_filtre[row][liste_jeux_donnees[0][0]-1];
			data_niv1_source[0]=csv_vecteur_filtre[row][0];
			data_niv1_source_lien[0]=csv_vecteur_filtre[row][1];
			data_niv1_geo_label=csv_vecteur_filtre[row][col_deb_geo+2*nb_pts_geo];

			data_niv1_values[0]=[];
			if (csv_vecteur_filtre[row][liste_jeux_donnees[0][0]-1]!="V") {
				for (var i_annees=0;i_annees<csv_vecteur_filtre[0].length;i_annees++) {
					if (liste_jeux.length==1) {
						data_niv1_values[0][i_annees]=csv_vecteur_filtre[row][i_annees]+ " " + csv_vecteur[lig_min_data-1][i_annees];
					} else {
						data_niv1_values[0][i_annees]=csv_vecteur_filtre[row][i_annees];
					}
				}
			}
				
			data_niv2_label[0]=[];
			data_niv2_id[0]=[];
			data_niv2_type[0]=[];
			data_niv2_source[0]=[];
			data_niv2_source_lien[0]=[];
			data_niv2_values[0]=[];
			data_niv3_label[0]=[];
			data_niv3_id[0]=[];
			data_niv3_type[0]=[];
			data_niv3_source[0]=[];
			data_niv3_source_lien[0]=[];
			data_niv3_values[0]=[];
			break;		// au cas où il y aurait 2 fois la même ligne
			}
		}
		
		// RECHERCHE DES DONNEES DE NIVEAU 2

	for (var row=0;row<csv_vecteur_filtre.length;row++) {
		if (csv_vecteur_filtre[row][col_deb_label+1+2*(nb_pts+1)]!="" && csv_vecteur_filtre[row][col_deb_label+1+2*(nb_pts+2)]=="" && csv_vecteur_filtre[row][col_deb_geo+1+2*(nb_pts_geo+1)]=="") {
		
			var data_niv2=false;
			for (var id_niv2=0;id_niv2<data_niv2_label[0].length;id_niv2++) {
				if (data_niv2_label[0][id_niv2]==csv_vecteur_filtre[row][col_deb_label+2+2*(niv_tp-1)]) {	// donnée de niveau 2 déjà dans data_niv2_label
					data_niv2=true;
					break;
				}
			}
			if (data_niv2==false) {
				data_niv2_label[0].push(csv_vecteur_filtre[row][col_deb_label+2*(nb_pts+1)]);
				data_niv2_id[0].push(csv_vecteur_filtre[row][col_deb_label+1+2*(nb_pts+1)]);
				data_niv2_type[0].push(csv_vecteur_filtre[row][liste_jeux_donnees[0][0]-1]);
				data_niv2_source[0].push(csv_vecteur_filtre[row][0]);
				data_niv2_source_lien[0].push(csv_vecteur_filtre[row][1]);
				data_niv2_values[0][id_niv2]=[];
				data_niv3_label[0][id_niv2]=[];
				data_niv3_id[0][id_niv2]=[];
				data_niv3_type[0][id_niv2]=[];
				data_niv3_source[0][id_niv2]=[];
				data_niv3_source_lien[0][id_niv2]=[];
				data_niv3_values[0][id_niv2]=[];
				if (csv_vecteur_filtre[row][liste_jeux_donnees[0][0]-1]!="V") {
					for (var i_annees=0;i_annees<csv_vecteur_filtre[0].length;i_annees++) {
						if (liste_jeux.length==1) {
							data_niv2_values[0][id_niv2][i_annees]=csv_vecteur_filtre[row][i_annees]+ " " + csv_vecteur[lig_min_data-1][i_annees];
						} else {
							data_niv2_values[0][id_niv2][i_annees]=csv_vecteur_filtre[row][i_annees];
						}
					}
				}				
			}
		}
	}
				
		// RECHERCHE DES DONNEES DE NIVEAU 3

	for (var row=0;row<csv_vecteur_filtre.length;row++) {
		if (csv_vecteur_filtre[row][col_deb_label+1+2*(nb_pts+2)]!="" && csv_vecteur_filtre[row][col_deb_label+1+2*(nb_pts+3)]=="" && csv_vecteur_filtre[row][col_deb_geo+1+2*(nb_pts_geo+1)]=="") {
		
			data_niv2=false;	// on doit retrouver le niv2 correspondant
			for (var id_niv2=0;id_niv2<data_niv2_label[0].length;id_niv2++) {
				if (data_niv2_label[0][id_niv2]==csv_vecteur_filtre[row][col_deb_label+2*(nb_pts+1)]) {	// donnée de niveau 2 retrouvée
					data_niv2=true;
					break;
				}
			}
			
			if (typeof data_niv3_label[id_niv1][id_niv2]!=="undefined") {
				var data_niv3=false;
				for (var id_niv3=0;id_niv3<data_niv3_label[id_niv1][id_niv2].length;id_niv3++) {
					if (data_niv3_label[id_niv1][id_niv2][id_niv3]==csv_vecteur_filtre[row][col_deb_label+4+2*(niv_tp-1)]) {	// donnée de niveau 3 déjà dans data_niv3_label
						data_niv3=true;
						break;
					}
				}
				if (data_niv3==false) {
					data_niv3_label[id_niv1][id_niv2].push(csv_vecteur_filtre[row][col_deb_label+2*(nb_pts+2)]);
					data_niv3_id[id_niv1][id_niv2].push(csv_vecteur_filtre[row][col_deb_label+1+2*(nb_pts+2)]);
					data_niv3_type[id_niv1][id_niv2].push(csv_vecteur_filtre[row][liste_jeux_donnees[0][0]-1]);
					data_niv3_source[id_niv1][id_niv2].push(csv_vecteur_filtre[row][0]);
					data_niv3_source_lien[id_niv1][id_niv2].push(csv_vecteur_filtre[row][1]);
					data_niv3_values[0][id_niv2][id_niv3]=[];
					if (csv_vecteur_filtre[row][liste_jeux_donnees[0][0]-1]!="V") {
						for (var i_annees=0;i_annees<csv_vecteur_filtre[0].length;i_annees++) {
							if (liste_jeux.length==1) {
								data_niv3_values[0][id_niv2][id_niv3][i_annees]=csv_vecteur_filtre[row][i_annees]+ " " + csv_vecteur[lig_min_data-1][i_annees];
							} else {
								data_niv3_values[0][id_niv2][id_niv3][i_annees]=csv_vecteur_filtre[row][i_annees];
							}
						}
					}					
				}
			}
		}
	}

	// RECHERCHE DES DONNEES GEOGRAPHIQUES
	
	for (var row=0;row<csv_vecteur_filtre.length;row++) {
		if (csv_vecteur_filtre[row][col_deb_label+2*(nb_pts+1)]=='' && csv_vecteur_filtre[row][col_deb_geo+2*(nb_pts_geo+1)]!='') {		// si c'est une ligne avec les données de niv1 + un 2ème niveau de données géographique
			var data_niv2_geo=false;
			for (var id_niv2=0;id_niv2<data_niv2_geo_label.length;id_niv2++) {
				if (data_niv2_geo_label[id_niv2]==csv_vecteur_filtre[row][col_deb_geo+2+2*(niv_tp_geo-1)]) {	// donnée géo de niveau 2 déjà dans data_niv2_geo_label
					data_niv2_geo=true;
					break;
				}
			}
			if (data_niv2_geo==false) {
				data_niv2_geo_label.push(csv_vecteur_filtre[row][col_deb_geo+2+2*(niv_tp_geo-1)]);
				data_niv2_geo_id.push(csv_vecteur_filtre[row][col_deb_geo+3+2*(niv_tp_geo-1)]);
			}
		}
	}
	
	if (JSON.stringify(data_niv1_values[0])==JSON.stringify([])) {
		var [data_niv1_label_ord,data_niv1_values_ord,data_niv1_id_ord,data_niv1_type_ord,data_niv1_source_ord,data_niv1_source_lien_ord,data_niv2_label_ord,data_niv2_values_ord,data_niv2_id_ord,data_niv2_type_ord,data_niv2_source_ord,data_niv2_source_lien_ord,data_niv3_label_ord,data_niv3_values_ord,data_niv3_id_ord,data_niv3_type_ord,data_niv3_source_ord,data_niv3_source_lien_ord]=[data_niv1_label,data_niv1_values,data_niv1_id,data_niv1_type,data_niv1_source,data_niv1_source_lien,data_niv2_label,data_niv2_values,data_niv2_id,data_niv2_type,data_niv2_source,data_niv2_source_lien,data_niv3_label,data_niv3_values,data_niv3_id,data_niv3_type,data_niv3_source,data_niv3_source_lien];
	} else {
		var vecteur_classement=data_niv1_values.map(subArray => subArray[colonne_annee]);
		var [data_niv1_label_ord,data_niv1_values_ord,data_niv1_id_ord,data_niv1_type_ord,data_niv1_source_ord,data_niv1_source_lien_ord,data_niv2_label_ord,data_niv2_values_ord,data_niv2_id_ord,data_niv2_type_ord,data_niv2_source_ord,data_niv2_source_lien_ord,data_niv3_label_ord,data_niv3_values_ord,data_niv3_id_ord,data_niv3_type_ord,data_niv3_source_ord,data_niv3_source_lien_ord]=data_ord(vecteur_classement,[data_niv1_label,data_niv1_values,data_niv1_id,data_niv1_type,data_niv1_source,data_niv1_source_lien,data_niv2_label,data_niv2_values,data_niv2_id,data_niv2_type,data_niv2_source,data_niv2_source_lien,data_niv3_label,data_niv3_values,data_niv3_id,data_niv3_type,data_niv3_source,data_niv3_source_lien]);
	}
	for (var i=0;i<data_niv2_label_ord.length;i++) {
		if (JSON.stringify(data_niv2_values[i][0])==JSON.stringify([])) {
			
		} else {
			var vecteur_classement=data_niv2_values[i].map(subArray => subArray[colonne_annee]);
			[data_niv2_label_ord[i],data_niv2_values_ord[i],data_niv2_id_ord[i],data_niv2_type_ord[i],data_niv2_source_ord[i],data_niv2_source_lien_ord[i],data_niv3_label_ord[i],data_niv3_values_ord[i],data_niv3_id_ord[i],data_niv3_type_ord[i],data_niv3_source_ord[i],data_niv3_source_lien_ord[i]]=data_ord(vecteur_classement,[data_niv2_label[i],data_niv2_values[i],data_niv2_id[i],data_niv2_type[i],data_niv2_source[i],data_niv2_source_lien[i],data_niv3_label[i],data_niv3_values[i],data_niv3_id[i],data_niv3_type[i],data_niv3_source[i],data_niv3_source_lien[i]]);
		}
		
		for (var j=0;j<data_niv3_label_ord[i].length;j++) {
			if (JSON.stringify(data_niv3_values[i][j][0])==JSON.stringify([])) {
				
			} else {
				var vecteur_classement=data_niv3_values[i][j].map(subArray => subArray[colonne_annee]);
				[data_niv3_label_ord[i][j],data_niv3_values_ord[i][j],data_niv3_id_ord[i][j],data_niv3_type_ord[i][j],data_niv3_source_ord[i][j],data_niv3_source_lien_ord[i][j]]=data_ord(vecteur_classement,[data_niv3_label[i][j],data_niv3_values[i][j],data_niv3_id[i][j],data_niv3_type[i][j],data_niv3_source[i][j],data_niv3_source_lien[i][j]]);
			}
		}
	}
	
	var vecteur_ret=[data_niv1_label_ord,data_niv1_values_ord,data_niv1_id_ord,data_niv1_type_ord,data_niv1_source_ord,data_niv1_source_lien_ord,data_niv2_label_ord,data_niv2_values_ord,data_niv2_id_ord,data_niv2_type_ord,data_niv2_source_ord,data_niv2_source_lien_ord,data_niv3_label_ord,data_niv3_values_ord,data_niv3_id_ord,data_niv3_type_ord,data_niv3_source_ord,data_niv3_source_lien_ord,data_niv1_geo_label,val_geo,data_niv2_geo_label,data_niv2_geo_id];
	return vecteur_ret;
}			


// la fonction qui calcule les coordonnées X et Y d'un point sur l'arc de cercle
    
function getPosition(angle, ray,ctrX,ctrY) {	

  
  var x = ctrX + ray * Math.cos(angle);
  var y = ctrY - ray * Math.sin(angle);

  return { x: x, y: y };
}


// Fonction qui arrondit les données pour éviter trop de chiffres après la virgule

 function data_arrondi(val) {
	if (val==' ' || val=='') {
		var texte_values_arr="?";
		return texte_values_arr;
	} else if (typeof val=="undefined") {
		var texte_values_arr="N/A";
		return texte_values_arr;		
	} else {

		var texte_values_nbr = parseFloat(val.replace(',', '.'));						
		var texte_values_nbr_str=texte_values_nbr.toString();
		if (texte_values_nbr<-1000 || texte_values_nbr>1000) {
			var texte_values_arr=texte_values_nbr.toFixed(0);
		} else if (texte_values_nbr<-1 || texte_values_nbr>1) {
			var texte_values_arr=texte_values_nbr.toFixed(1);
		} else if (texte_values_nbr<-0.1 || texte_values_nbr>0.1) {
			var texte_values_arr=texte_values_nbr.toFixed(2);
		} else {
			var texte_values_arr=texte_values_nbr.toFixed(3);
		}
		let options = {
		  useGrouping: true,
		};
		texte_values_arr = parseFloat(texte_values_arr).toLocaleString('fr-FR', options);
				
	var texte_values_arr_str=texte_values_arr.toString();
	var texte_values_arr_str=texte_values_arr_str.replace('.', ',');
	return texte_values_arr_str + val.substring(texte_values_nbr_str.length,val.length);
	}
 }
 
 function data_in_pourcent(val, total,type,liste_jx) {
	if (val==' ' || val=='') {
		var texte_values_arr="?";
	} else {
		var texte_values_nbr = parseFloat(val.replace(',', '.').replace(' ', ''));
		if (type=='ratio' || typeof total=="undefined") {		// si on est sur des ratios ou si le niveau 1 est une ventilation, on affiche seulement la valeur
			if (texte_values_nbr<10 && texte_values_nbr>-10) {
				var texte_values_arr=texte_values_nbr.toFixed(2);
			} else if (texte_values_nbr<100 && texte_values_nbr>-100) {
				var texte_values_arr=texte_values_nbr.toFixed(1);
			} else {
				var texte_values_arr=texte_values_nbr.toFixed(0);
			}
			if (typeof total=="undefined") {					// si pas de niveau 1, on rajoute l'unité
				texte_values_arr=data_arrondi(texte_values_arr);
				texte_values_arr=texte_values_arr + ' ' + liste_jx[1][0]
			}
		} else {
			var total_nbr = parseFloat(total.replace(',', '.').replace(' ', ''));
			var texte_values_nbr=100*(texte_values_nbr/total_nbr);
			if (texte_values_nbr<0.05 && texte_values_nbr>-0.05) {
				var texte_values_arr=texte_values_nbr.toFixed(2) + '%';
			} else if (texte_values_nbr<0.5 && texte_values_nbr>-0.5) {
				var texte_values_arr=texte_values_nbr.toFixed(1)+ '%';
			} else {
				var texte_values_arr=texte_values_nbr.toFixed(0)+ '%';
			}
		}
	}
	return texte_values_arr;
}

// fonction qui classe les vecteurs contenus dans "vecteur", en prenant l'ordre du vecteur numéro "num"
function data_ord(vect_classement,vecteur) {
	
	// var vect_class = vecteur[num].slice();
	
	for (var i=0;i<vect_classement.length;i++) {
		if (vect_classement[i]!=' ' && typeof vect_classement[i]!="undefined") {		// si ce n'est pas un niveau de ventilation	
			vect_classement[i] = parseFloat(vect_classement[i].replace(',', '.'));
		}
	}
		
	for (var i=0;i<vect_classement.length;i++) {
		for (var j=0;j<vect_classement.length-i-1;j++) {
			if (typeof vect_classement[j]=="undefined" || vect_classement[j]<vect_classement[j+1]) {
			//if (vect_classement[j]<vect_classement[j+1]) {
				var temp = vect_classement[j];
				vect_classement[j]=vect_classement[j+1];
				vect_classement[j+1]=temp;
				for (var k=0;k<vecteur.length;k++) {
					var temp = vecteur[k][j];
					vecteur[k][j]=vecteur[k][j+1];
					vecteur[k][j+1]=temp;
				}
			}
		}
	}
	
	return vecteur;
}




function nb_sous_niveaux(csv_vecteur,id,id_geo) {

	// vérifier si sous-niveaux à afficher et si sous-niveau 1 a plus de 4 données
	
	var id_sous_niv1=id + '.1';
	var id_sous_niv1_sup4=id + '.4';
	var sous_niveau_sup4=0;
	var id_sous_niv2=id_sous_niv1 + '.1';
	var tableau_id=id.split(".");
	var niv_top = tableau_id.length;
	var tableau_id_geo=id_geo.split(".");
	var niv_top_geo = tableau_id_geo.length;

	var col_id = col_deb_label-1+2*niv_top;
	var col_sous_niv1 = col_deb_label-1+2*niv_top+2;
	var col_sous_niv2 = col_deb_label-1+2*niv_top+4;
	var col_id_geo =col_deb_geo - 1 + 2*niv_top_geo;

	var sous_niveau=0;
	var ventil=0;
	
	// Finalement on accepte de représenter les ventilations en niveau 1 (sinon impossible de descendre quand on ne représente que 2 niveaux cause 4 ventils de niveau 1
/* 	if (csv_vecteur[0][2]!="Structure" && csv_vecteur[0][2]!="Accueil") {
		for (var row=lig_min_data+1;row<csv_vecteur.length-1;row++) {
			if (csv_vecteur[row][col_id]==id && csv_vecteur[row][col_id+1]=="" && csv_vecteur[row][col_id_geo]==id_geo && csv_vecteur[row][col_id_geo+1]=="") {
				if (csv_vecteur[row][liste_jeux_donnees[0][0]-1]=="V") {		// si c'est une ventilation, on remonte d'un cran (sélection en fonction du fait qu'on soit en données ou en géographie (pas de ventilation en géographie)
					if (id.substring(0,1)=="V") {			// si on regarde bien en donnée
						var id=id.substring(0,id.length-2);		
						var id_sous_niv1=id + '.1';
						var id_sous_niv1_sup4=id + '.4';
						var sous_niveau_sup4=0;
						var id_sous_niv2=id_sous_niv1 + '.1';
						var tableau_id=id.split(".");
						var niv_top = tableau_id.length;
						var col_id = col_deb_label-1+2*niv_top;
						var col_sous_niv1 = col_deb_label-1+2*niv_top+2;
						var col_sous_niv2 = col_deb_label-1+2*niv_top+4;
					} else if (id.substring(0,2)=="G0" && id_geo.substring(0,2)=="V0"){		// si on est en géographie
						var id_geo=id_geo.substring(0,id_geo.length-2);
						var tableau_id_geo=id_geo.split(".");
						var niv_top_geo = tableau_id_geo.length;						 
						var col_id_geo =col_deb_geo - 1 + 2*niv_top_geo;
					}
				}
				break;
			}
		}
	}
 */	
	for (var row=lig_min_data+1;row<csv_vecteur.length-1;row++) {
		if (csv_vecteur[row][col_sous_niv1]==id_sous_niv1) {
			sous_niveau=1;
		}
		if (csv_vecteur[row][col_sous_niv1]==id_sous_niv1_sup4) {
			sous_niveau_sup4=1;
			break;
		}		
	}
	
	for (var row=lig_min_data+1;row<csv_vecteur.length-1;row++) {
		if (csv_vecteur[row][col_sous_niv2].substring(0,id.length)==id && csv_vecteur[row][col_sous_niv2].length==id.length+4) {
			sous_niveau=2;
			break;
		}
	}

	return [niv_top,id,sous_niveau,sous_niveau_sup4,id_geo,niv_top_geo];
}


function creation_liste_der(csv_vecteur, val_select,left_box,top_box,liste_select,nom_classe,liste_data) {

	// insertion box pour choix années disponibles et liste déroulante
	liste_data.innerHTML = "";
	liste_data.classList.add(nom_classe);
	if (liste_select.length==1) {
		var texte_liste = document.createTextNode(liste_select[0]);
		liste_data.appendChild(texte_liste);
	} else {
		liste_data.style.backgroundColor = '#aaaaff';
		for (var i_liste=0;i_liste<liste_select.length;i_liste++) {
			var option=document.createElement("option");
			option.value=liste_select[i_liste];
			option.text=liste_select[i_liste];
			liste_data.appendChild(option);
		}		
	}

	liste_data.style.top= top_box;
	liste_data.style.left= left_box;
	liste_data.style.fontSize = '18px';
	liste_data.style.fontWeight = 550;
	liste_data.style.textAlign = 'Center'; // ne semble pas marcher si mis en css
	
	liste_data.value=val_select;
	document.body.appendChild(liste_data);

	// gestionnaire d'événements quand on change l'année

	if (init_liste_der_annees==0) {							// à ne faire que la première fois que la fonction est appelée
		csv_vect=csv_vecteur;
		if (liste_data==liste_der_annees) {
			liste_data.addEventListener("change", ecouteur_liste_der_annees);
			init_liste_der_annees=1;
		}
	}
	if (init_liste_der_unites==0) {							// à ne faire que la première fois que la fonction est appelée
		csv_vect=csv_vecteur;
		if (liste_data==liste_der_unites_choix) {
			liste_data.addEventListener("change", ecouteur_liste_der_unites_choix);
			init_liste_der_unites=1;
		}
	}
}

function ecouteur_liste_der_unites_choix() {
	liste_der_unites_choix.removeEventListener("change", ecouteur_liste_der_unites_choix);
	var niv1_object = document.querySelector('.box_niv1_label');
	var niv1_val=niv1_object.dataset.valeur;
	var valeur_geo_object=document.querySelector('.box_geog_niv1');
	var valeur_geo=valeur_geo_object.dataset.valeur;
	var tableau_geo=valeur_geo.split(".");
	var niveau_top_geo = tableau_geo.length;
	
	var niv1_unite_val=liste_der_unites_choix.value;
	var num_jeux=0;
	for (var i=0;i<liste_jeux_donnees[0].length;i++) {
		if (niv1_unite_val==liste_jeux_donnees[1][i]) {
			num_jeux=i;
		}
	}
	var valeur_annee = liste_der_annees.value;
	for (i_annees=liste_jeux_donnees[0][num_jeux];i_annees<csv_vect[lig_min_data].length;i_annees++) {
		if (csv_vect[lig_min_data][i_annees]==valeur_annee) {
			var col_annee=i_annees;
			break
		}
	}
	// }
	efface_boites();
	var [niv_box1, niv1_val,nb_sous_niv,sous_niv_sup4,valeur_geo,niveau_top_geo]=nb_sous_niveaux(csv_vect,niv1_val,valeur_geo);
	Mise_a_jour(csv_vect, col_annee,niv_box1,niv1_val,nb_sous_niv,sous_niv_sup4, orig,niveau_top_geo,valeur_geo,num_jeux);
	// liste_data.value=valeurSelectionnee;
	// liste_data.text=valeurSelectionnee;	
}

function ecouteur_liste_der_annees() {
	liste_der_annees.removeEventListener("change", ecouteur_liste_der_annees);
	var niv1_object = document.querySelector('.box_niv1_label');
	var niv1_val=niv1_object.dataset.valeur;
	var valeur_geo_object=document.querySelector('.box_geog_niv1');
	var valeur_geo=valeur_geo_object.dataset.valeur;
	var tableau_geo=valeur_geo.split(".");
	var niveau_top_geo = tableau_geo.length;
	
	var num_jeux=0;
	if (document.querySelector('.box_niv1_unite')!=null) {
		var niv1_unite_object = document.querySelector('.box_niv1_unite');
		var niv1_unite_val=niv1_unite_object.value;
		for (var i=0;i<liste_jeux_donnees[0].length;i++) {
			if (niv1_unite_val==liste_jeux_donnees[1][i]) {
				num_jeux=i;
			}
		}
	}
	
	var valeur_annee = liste_der_annees.value;
	for (i_annees=liste_jeux_donnees[0][num_jeux];i_annees<csv_vect[lig_min_data].length;i_annees++) {
		if (csv_vect[lig_min_data][i_annees]==valeur_annee) {
			var col_annee=i_annees;
			break
		}
	}
	efface_boites();
	var [niv_box1, niv1_val,nb_sous_niv,sous_niv_sup4,valeur_geo,niveau_top_geo]=nb_sous_niveaux(csv_vect,niv1_val,valeur_geo);
	Mise_a_jour(csv_vect, col_annee,niv_box1,niv1_val,nb_sous_niv,sous_niv_sup4, orig,niveau_top_geo,valeur_geo,num_jeux);
}

function efface_boites() {
	var liste_boites='.box_niv1_label,.box_niv1_value,.box_niv2_label,.box_niv2_value,.box_niv3_label,.box_niv3_value,.struct_niv1,.struct_niv2,.struct_niv3,.ovale_niv1,.ovale_niv2,.ovale_niv3,.box_line,.lien_niv1,.lien_niv3,.lien_niv3_carre,.box_geog_niv1,.box_geog_niv2,.lien_niv1_geo,.lien_niv2_geo,.box_texte_der,.lien_niv1_accueil,.lien_niv2_accueil,.box_select,.switch_KPI_geog,.box_niv1_value_seul,.box_niv1_unite';
	var boites=document.querySelectorAll(liste_boites);
	boites.forEach(boite => boite.remove());
	init_liste_der_annees=0;
	init_liste_der_unites=0;
}

function afficherPopup(boite_click,pos_xy, source,source_lien,an_N,an_Nmoins1,an_Nmoins5,unit_N,val_N,val_Nmoins1,val_Nmoins5,absc,ordo,label_data) {
    
	if (isPopupOpen == false) {
		var evol_Nmoins1 = ((parseFloat(val_N.replace(',','.').replace(' ','')) / parseFloat(val_Nmoins1.replace(',','.').replace(' ',''))-1)*100).toFixed(1) ;
		var evol_Nmoins5 = ((parseFloat(val_N.replace(',','.').replace(' ','')) / parseFloat(val_Nmoins5.replace(',','.').replace(' ',''))-1)*100).toFixed(1) ;
		
		
		var Popup_name="popup_data" + label_data;
		vect_popup.push(Popup_name);

			
		// popup pour data, evol, source, graphe
		
		window.Popup_name = document.createElement('div');
		window.Popup_name.style.height = '370px';// choisir une taille pour la popup
		window.Popup_name.style.width = '300px'; 
		window.Popup_name.style.border = '1px solid black'; // mettre un cadre autour de la popup	
		window.Popup_name.style.top = Math.max(marge_bord-parseFloat(boite_click.style.top),- 0.5*parseFloat(window.Popup_name.style.height)) + 'px';
		window.Popup_name.style.left =  boite_click.clientWidth + 'px';	
		window.Popup_name.style.backgroundColor = '#D9E1F2'; // choisir une couleur de fond pour la window.Popup_name
		window.Popup_name.style.opacity = 0.95;
		window.Popup_name.style.fontSize = '10px';
		window.Popup_name.style.whiteSpace = "pre-wrap";
		window.Popup_name.classList.add("premier-plan");
		window.Popup_name.style.display = 'inline';
		
		var ligneGauche = document.createElement('p');
		ligneGauche.style.textAlign = 'left';
		ligneGauche.style.fontWeight = 'bold';
		ligneGauche.innerHTML += ' VALEUR'  ;
		window.Popup_name.appendChild(ligneGauche);
		

		// window.Popup_name.innerHTML += 'En ' + an_N + ' : ' +label_data + ' = ' +  data_arrondi(val_N)+ ' ' + unit_N + '<br>'+'<br>' ;
		window.Popup_name.innerHTML += 'En ' + an_N + ' : ' + data_arrondi(val_N)+ ' ' + unit_N + '<br>'+'<br>' ;
		
		var ligneNoire = document.createElement("div");
		ligneNoire.style.width = "100%";
		ligneNoire.style.height = "1px";
		ligneNoire.style.backgroundColor = "black";
		window.Popup_name.appendChild(ligneNoire);
		
		
		var ligneGauche = document.createElement('p');
		ligneGauche.style.textAlign = 'left';	
		ligneGauche.style.fontWeight = 'bold';		
		ligneGauche.innerHTML += ' TENDANCE'+ '<br>';
		window.Popup_name.appendChild(ligneGauche);

		if (evol_Nmoins1>=0) {
			window.Popup_name.innerHTML += ' + ' + evol_Nmoins1 + ' % vs ' + an_Nmoins1 + ' (' + data_arrondi(val_Nmoins1) + ')' ;
		} else {
			window.Popup_name.innerHTML += ' - ' + Math.abs(evol_Nmoins1) + ' % vs ' + an_Nmoins1 + ' (' + data_arrondi(val_Nmoins1) + ')' ;
		}
		if (evol_Nmoins5>=0) {
			window.Popup_name.innerHTML += '<br>' + ' + ' + evol_Nmoins5 + ' % vs ' + an_Nmoins5 + ' (' + data_arrondi(val_Nmoins5) + ')' +'<br>'+'<br>';
		} else {
			window.Popup_name.innerHTML += '<br>' + ' - ' + Math.abs(evol_Nmoins5) + ' % vs ' + an_Nmoins5 + ' (' + data_arrondi(val_Nmoins5) + ')' +'<br>'+'<br>';
		}
		
		window.Popup_name.appendChild(ligneNoire);
		
		ligneGauche = document.createElement('p');
		ligneGauche.style.textAlign = 'left';	
		ligneGauche.style.fontWeight = 'bold';		
		ligneGauche.innerHTML += ' SOURCE'+ '<br>';
		window.Popup_name.appendChild(ligneGauche);
		
		var texte_source = source;
		var lien = document.createElement('a');
		lien.href = source_lien;
		lien.target = "_blank";
		lien.style.cursor = "pointer";
		lien.innerText = source; // Affiche la valeur de monLien dans le lien
		
		window.Popup_name.innerHTML += texte_source.replace(source,lien.outerHTML) + '<br>' + '<br>';	
			
		window.Popup_name.appendChild(ligneNoire);

		var ligneGauche = document.createElement('p');
		ligneGauche.style.textAlign = 'left';	
		ligneGauche.style.fontWeight = 'bold';		
		ligneGauche.innerHTML += ' EVOLUTION'+ '<br>';
		window.Popup_name.appendChild(ligneGauche);
		

		boite_click.appendChild(window.Popup_name);
		isPopupOpen = true;
		
		var canvas = document.createElement("canvas");
		canvas.id = "myChart";
		
	
		canvas.width =300;
		canvas.height = 150;
		
		window.Popup_name.appendChild(canvas);
		
		var ctx = canvas.getContext('2d');
		var myChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: absc,
				datasets: [{
					label: label_data,
					data: ordo,
					backgroundColor: 'rgba(75, 192, 192, 0.2)',
					borderColor: 'rgba(75, 192, 192, 1)',
					borderWidth: 1
				}]
			},
			options: {
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});
		
		document.addEventListener("mousedown", function(e) {
			var box_data=window.Popup_name;
			if (isPopupOpen  && !window.Popup_name.contains(e.target)) {
				fonctionDeFermeture(e, window.Popup_name);
				isPopupOpen = false;
			}				
		});
	}
}

function fonctionDeFermeture(e,pop_fen) {
	// Vérifiez si le clic a été effectué en dehors du pop-up
	var nb_pop=vect_popup.length;
	for (var i=0;i<nb_pop;i++) {
		// window.vect_popup[0].remove();
		pop_fen.remove();
		vect_popup.shift();
	}
}